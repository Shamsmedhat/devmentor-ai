"use client";

import { useCallback } from "react";

import { useChat as useAiChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  type ChatStatus,
  type FileUIPart,
  type UIMessage,
} from "ai";

import type { ChatMessage as PersistedChatMessage } from "@/lib/types/chat";

/** Minimal seed shape — what DB-loaded chat history provides. */
type InitialMessage = Pick<PersistedChatMessage, "id" | "role" | "content">;

interface UseChatOptions {
  api?: string;
  initialMessages?: InitialMessage[];
  onError?: (error: Error) => void;
  /** Fires when streaming completes (not on abort/error). */
  onFinish?: (message: { id: string; content: string }) => void;
}

interface UseChatReturn {
  messages: UIMessage[];
  status: ChatStatus;
  isLoading: boolean;
  stop: () => void;
  sendMessage: (msg: {
    text: string;
    files: FileUIPart[];
  }) => Promise<void>;
}

/** Concatenate a UIMessage's text parts into a single string for persistence/title. */
export function getMessageContent(message: UIMessage): string {
  if (!Array.isArray(message.parts)) return "";
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export function useChat({
  api: _api = "/api/chat",
  initialMessages,
  onError,
  onFinish,
}: UseChatOptions = {}): UseChatReturn {
  const {
    messages,
    status,
    stop,
    sendMessage: aiSendMessage,
  } = useAiChat({
    transport: new DefaultChatTransport({ api: _api }),
    messages: (initialMessages ?? []).map((message) => ({
      id: message.id,
      role: message.role,
      parts: [{ type: "text" as const, text: message.content }],
    })),
    onError,
    onFinish: onFinish
      ? ({ message, isAbort, isError }) => {
          if (isAbort || isError) return;
          const content = getMessageContent(message);
          if (!content.trim()) return;
          onFinish({ id: message.id, content });
        }
      : undefined,
  });

  const sendMessage = useCallback(
    async (msg: { text: string; files: FileUIPart[] }): Promise<void> => {
      const trimmed = msg.text.trim();
      try {
        if (msg.files.length > 0) {
          await aiSendMessage(
            trimmed
              ? { text: trimmed, files: msg.files }
              : { files: msg.files },
          );
        } else {
          await aiSendMessage({ text: trimmed });
        }
      } catch (err) {
        // AbortError surfaces when stop() interrupts the stream — expected.
        if (err instanceof Error && err.name === "AbortError") return;
        throw err;
      }
    },
    [aiSendMessage],
  );

  return {
    messages,
    status,
    isLoading: status === "submitted" || status === "streaming",
    stop,
    sendMessage,
  };
}
