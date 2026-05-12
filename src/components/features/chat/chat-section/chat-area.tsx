"use client";

import type { ChatUIMessage } from "@/lib/types/chat";

import ChatHeader from "./chat-header";
import RAGChatBot from "./rag-chatbot";
import { useState } from "react";

interface ChatAreaProps {
  sessionId: string | null;
  initialMessages: ChatUIMessage[];
}

export default function ChatArea({
  sessionId,
  initialMessages,
}: ChatAreaProps) {
  // State
  const [isArabicResponse, setIsArabicResponse] = useState<boolean>(false);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat header */}
      <ChatHeader
        setIsArabicResponse={setIsArabicResponse}
        isArabicResponse={isArabicResponse}
      />

      {/* Chat */}
      <RAGChatBot
        key={sessionId ?? "new"}
        sessionId={sessionId}
        initialMessages={initialMessages}
        isArabicResponse={isArabicResponse}
      />
    </div>
  );
}
