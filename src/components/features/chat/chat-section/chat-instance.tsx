"use client";

import { useChatUi } from "@/lib/context/chat-ui.context";
import type { ChatUIMessage } from "@/lib/types/chat";
import RAGChatBot from "./rag-chatbot";

interface ChatInstanceProps {
  sessionId: string | null;
  initialMessages: ChatUIMessage[];
}

// The server page can't read client context, so this wrapper folds the
// client-side reset key into RAGChatBot's React key. Route changes flow
// through sessionId; New Chat bumps chatInstanceKey - either one remounts
// RAGChatBot (and its useChat state) cleanly.
export default function ChatInstance({
  sessionId,
  initialMessages,
}: ChatInstanceProps) {
  // Context
  const { chatInstanceKey } = useChatUi();

  return (
    <RAGChatBot
      key={`${sessionId ?? "new"}:${chatInstanceKey}`}
      sessionId={sessionId}
      initialMessages={initialMessages}
    />
  );
}
