// Minimal WebRTC signaling relay for testing multi-peer ("room") mesh
// connections locally. It only relays join/leave/SDP/ICE messages between
// browsers in the same room; it never sees or stores any app data — actual
// sync happens directly peer-to-peer over WebRTC data channels.
//
// Run with: node server/signaling-server.mjs
import { WebSocketServer } from "ws";

const PORT = process.env.SIGNALING_PORT
    ? Number(process.env.SIGNALING_PORT)
    : 8787;

const wss = new WebSocketServer({ port: PORT });

/** @type {Map<string, Map<string, import("ws").WebSocket>>} */
const rooms = new Map();

function roomOf(ws) {
    return ws.roomId ? rooms.get(ws.roomId) : undefined;
}

wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
        let msg;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }

        if (msg.type === "join") {
            const { room, peerId } = msg;
            ws.roomId = room;
            ws.peerId = peerId;
            let members = rooms.get(room);
            if (!members) {
                members = new Map();
                rooms.set(room, members);
            }
            ws.send(
                JSON.stringify({ type: "peers", peers: [...members.keys()] }),
            );
            for (const peer of members.values()) {
                peer.send(JSON.stringify({ type: "peer-joined", peerId }));
            }
            members.set(peerId, ws);
            return;
        }

        if (msg.type === "signal") {
            const members = roomOf(ws);
            const target = members?.get(msg.to);
            target?.send(
                JSON.stringify({ type: "signal", from: ws.peerId, data: msg.data }),
            );
        }
    });

    ws.on("close", () => {
        const members = roomOf(ws);
        if (!members || !ws.peerId) return;
        members.delete(ws.peerId);
        if (members.size === 0) rooms.delete(ws.roomId);
        for (const peer of members.values()) {
            peer.send(JSON.stringify({ type: "peer-left", peerId: ws.peerId }));
        }
    });
});

console.log(`Signaling relay listening on ws://0.0.0.0:${PORT}`);
