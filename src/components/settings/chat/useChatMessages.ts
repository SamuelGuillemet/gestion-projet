import { useEffect, useState } from "react";
import type { ChatDoc, ChatMessage } from "./chat-yjs";

export function useChatMessages(chat: ChatDoc | null): ChatMessage[] {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => chat?.messages.toArray() ?? [],
  );

  useEffect(() => {
    if (!chat) {
      setMessages([]);
      return;
    }
    const sync = () => setMessages(chat.messages.toArray());
    sync();
    chat.messages.observe(sync);
    return () => chat.messages.unobserve(sync);
  }, [chat]);

  return messages;
}
