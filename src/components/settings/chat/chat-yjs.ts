import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
}

export interface ChatDoc {
  doc: Y.Doc;
  messages: Y.Array<ChatMessage>;
  persistence: IndexeddbPersistence;
}

// Cached per room so re-joining the same room in the same tab reuses state.
const docs = new Map<string, ChatDoc>();

export function getChatDoc(roomId: string): ChatDoc {
  const existing = docs.get(roomId);
  if (existing) return existing;

  const doc = new Y.Doc();
  const messages = doc.getArray<ChatMessage>("messages");
  const persistence = new IndexeddbPersistence(`gp-chat-${roomId}`, doc);
  const entry: ChatDoc = { doc, messages, persistence };
  docs.set(roomId, entry);
  return entry;
}
