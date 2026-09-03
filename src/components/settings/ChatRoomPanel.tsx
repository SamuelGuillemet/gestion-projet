import { LogOut, Send, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Room } from "@/lib/webrtc-room";
import { type ChatDoc, type ChatMessage, getChatDoc } from "./chat/chat-yjs";
import { useChatMessages } from "./chat/useChatMessages";

type ConnState = "idle" | "joined";

const DEFAULT_SERVER_URL = "ws://localhost:8787";

const initials = (name: string) =>
  name.trim().slice(0, 2).toUpperCase() || "??";

const formatTime = (ms: number) =>
  new Date(ms).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export function ChatRoomPanel() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [roomId, setRoomId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [state, setState] = useState<ConnState>("idle");
  const [peerCount, setPeerCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState<ChatDoc | null>(null);
  const roomRef = useRef<Room | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useChatMessages(chat);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => () => roomRef.current?.leave(), []);

  const join = () => {
    const room = roomId.trim();
    if (!room) return;

    const chatDoc = getChatDoc(room);

    // Rebroadcast only genuinely local edits, never updates we just applied
    // from a peer (that would echo forever around the mesh).
    chatDoc.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;
      roomRef.current?.broadcast(update);
    });

    const conn = new Room(serverUrl.trim(), room, {
      onPeerConnected: (peerId) => {
        setPeerCount((n) => n + 1);
        // Auto-replay: send our full known state to the peer that just joined.
        conn.sendTo(peerId, Y.encodeStateAsUpdate(chatDoc.doc));
      },
      onPeerDisconnected: () => setPeerCount((n) => Math.max(0, n - 1)),
      onMessage: (_peerId, data) => {
        if (typeof data === "string") return;
        Y.applyUpdate(chatDoc.doc, new Uint8Array(data), "remote");
      },
    });

    roomRef.current = conn;
    setChat(chatDoc);
    setRoomId(room);
    setState("joined");
  };

  const leave = () => {
    roomRef.current?.leave();
    roomRef.current = null;
    setChat(null);
    setPeerCount(0);
    setState("idle");
  };

  const send = () => {
    const text = draft.trim();
    const room = roomRef.current;
    if (!text || !room || !chat) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: room.localPeerId,
      senderName: displayName.trim() || "Anonyme",
      text,
      createdAt: Date.now(),
    };
    chat.messages.push([message]);
    setDraft("");
  };

  return (
    <div className="space-y-4 mt-2 max-w-xl">
      <p className="text-muted-foreground text-sm">
        Chat P2P persistant (expérimentation Yjs) : un petit relai de
        signalisation (
        <code className="text-xs">node server/signaling-server.mjs</code>) met
        les navigateurs en relation, mais les messages passent en direct entre
        eux via WebRTC. Les messages vivent dans un{" "}
        <code className="text-xs">Y.Doc</code> persistant (IndexedDB via{" "}
        <code className="text-xs">y-indexeddb</code>) ; à la connexion, l'état
        complet est échangé et fusionné (CRDT), donc l'historique est rejoué
        automatiquement à tout nouveau pair.
      </p>

      {state === "idle" && (
        <div className="space-y-2">
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="ws://localhost:8787"
          />
          <Input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Nom de la room (ex: equipe-test)"
          />
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="Votre nom affiché"
          />
          <Button onClick={join} disabled={!roomId.trim()}>
            Rejoindre la room
          </Button>
        </div>
      )}

      {state === "joined" && (
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle>{roomId}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="size-3" />
                {peerCount}
              </Badge>
              <Button variant="outline" size="xs" onClick={leave}>
                <LogOut className="size-3.5" />
                Quitter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="border rounded-md h-80">
              <div className="space-y-3 p-3">
                {messages.length === 0 && (
                  <p className="py-8 text-muted-foreground text-sm text-center">
                    Aucun message pour l'instant.
                  </p>
                )}
                {messages.map((m) => {
                  const isMe = m.senderId === roomRef.current?.localPeerId;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar size="sm">
                        <AvatarFallback>
                          {initials(m.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                      >
                        <span className="text-muted-foreground text-xs">
                          {m.senderName} · {formatTime(m.createdAt)}
                        </span>
                        <div
                          className={`rounded-lg px-3 py-1.5 text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Écrire un message..."
              />
              <Button size="icon" onClick={send} disabled={!draft.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
