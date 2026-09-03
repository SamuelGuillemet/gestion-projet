// WebRTC mesh room: connects through a small signaling relay (see
// server/signaling-server.mjs) purely to discover peers and exchange
// SDP/ICE. Once connected, data flows directly peer-to-peer over WebRTC
// data channels — the relay never sees app data.

interface PeersMessage {
  type: "peers";
  peers: string[];
}
interface PeerJoinedMessage {
  type: "peer-joined";
  peerId: string;
}
interface PeerLeftMessage {
  type: "peer-left";
  peerId: string;
}
interface SdpSignalData {
  sdp: RTCSessionDescriptionInit;
}
interface CandidateSignalData {
  candidate: RTCIceCandidateInit;
}
type SignalData = SdpSignalData | CandidateSignalData;
interface SignalMessage {
  type: "signal";
  from: string;
  data: SignalData;
}
type ServerMessage =
  | PeersMessage
  | PeerJoinedMessage
  | PeerLeftMessage
  | SignalMessage;

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function sendOnChannel(
  channel: RTCDataChannel,
  data: string | Uint8Array,
): void {
  if (typeof data === "string") channel.send(data);
  else channel.send(new Uint8Array(data));
}

export interface RoomHandlers {
  onPeerConnected: (peerId: string) => void;
  onPeerDisconnected: (peerId: string) => void;
  onMessage: (peerId: string, data: string | ArrayBuffer) => void;
}

interface PeerEntry {
  pc: RTCPeerConnection;
  channel: RTCDataChannel | null;
  pendingCandidates: RTCIceCandidateInit[];
}

export class Room {
  readonly localPeerId = crypto.randomUUID();
  private ws: WebSocket;
  private peers = new Map<string, PeerEntry>();
  private handlers: RoomHandlers;

  constructor(serverUrl: string, roomId: string, handlers: RoomHandlers) {
    this.handlers = handlers;
    this.ws = new WebSocket(serverUrl);
    this.ws.onopen = () =>
      this.sendToServer({
        type: "join",
        room: roomId,
        peerId: this.localPeerId,
      });
    this.ws.onmessage = (e) => this.handleServerMessage(JSON.parse(e.data));
  }

  private sendToServer(msg: unknown): void {
    this.ws.send(JSON.stringify(msg));
  }

  private handleServerMessage(msg: ServerMessage): void {
    switch (msg.type) {
      case "peers":
        for (const peerId of msg.peers) this.connectTo(peerId, true);
        break;
      case "peer-joined":
        this.connectTo(msg.peerId, false);
        break;
      case "peer-left":
        this.peers.get(msg.peerId)?.pc.close();
        this.peers.delete(msg.peerId);
        this.handlers.onPeerDisconnected(msg.peerId);
        break;
      case "signal":
        this.handleRemoteSignal(msg.from, msg.data);
        break;
    }
  }

  private getOrCreatePeer(peerId: string): PeerEntry {
    const existing = this.peers.get(peerId);
    if (existing) return existing;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const entry: PeerEntry = { pc, channel: null, pendingCandidates: [] };
    this.peers.set(peerId, entry);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.sendToServer({
          type: "signal",
          to: peerId,
          data: { candidate: e.candidate.toJSON() },
        });
      }
    };
    pc.ondatachannel = (e) => this.bindChannel(peerId, entry, e.channel);

    return entry;
  }

  private connectTo(peerId: string, initiator: boolean): void {
    if (this.peers.has(peerId)) return;
    const entry = this.getOrCreatePeer(peerId);
    if (!initiator) return;

    const channel = entry.pc.createDataChannel("sync");
    this.bindChannel(peerId, entry, channel);
    entry.pc.onnegotiationneeded = async () => {
      const offer = await entry.pc.createOffer();
      await entry.pc.setLocalDescription(offer);
      this.sendToServer({
        type: "signal",
        to: peerId,
        data: { sdp: entry.pc.localDescription },
      });
    };
  }

  private bindChannel(
    peerId: string,
    entry: PeerEntry,
    channel: RTCDataChannel,
  ): void {
    channel.binaryType = "arraybuffer";
    entry.channel = channel;
    channel.onopen = () => this.handlers.onPeerConnected(peerId);
    channel.onclose = () => this.handlers.onPeerDisconnected(peerId);
    channel.onmessage = (e) => this.handlers.onMessage(peerId, e.data);
  }

  private async handleRemoteSignal(
    from: string,
    data: SignalData,
  ): Promise<void> {
    const entry = this.getOrCreatePeer(from);

    if ("sdp" in data) {
      await entry.pc.setRemoteDescription(data.sdp);
      for (const candidate of entry.pc.remoteDescription
        ? entry.pendingCandidates.splice(0)
        : []) {
        await entry.pc.addIceCandidate(candidate);
      }
      if (data.sdp.type === "offer") {
        const answer = await entry.pc.createAnswer();
        await entry.pc.setLocalDescription(answer);
        this.sendToServer({
          type: "signal",
          to: from,
          data: { sdp: entry.pc.localDescription },
        });
      }
    } else if (entry.pc.remoteDescription) {
      await entry.pc.addIceCandidate(data.candidate);
    } else {
      entry.pendingCandidates.push(data.candidate);
    }
  }

  broadcast(data: string | Uint8Array): void {
    for (const entry of this.peers.values()) {
      if (entry.channel?.readyState === "open")
        sendOnChannel(entry.channel, data);
    }
  }

  sendTo(peerId: string, data: string | Uint8Array): void {
    const entry = this.peers.get(peerId);
    if (entry?.channel?.readyState === "open")
      sendOnChannel(entry.channel, data);
  }

  leave(): void {
    this.ws.close();
    for (const entry of this.peers.values()) entry.pc.close();
    this.peers.clear();
  }
}
