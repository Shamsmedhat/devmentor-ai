"use client";

import { useCallback, useState } from "react";

import { generateId } from "ai";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseChatOptions {
  api?: string;
  onError?: (error: Error) => void;
  onFinish?: () => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  handleSubmit: (e?: React.FormEvent) => void;
}

export function useChat({
  api = "/api/chat",
  onError,
  onFinish,
}: UseChatOptions = {}): UseChatReturn {
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Functions
  function handleInputChange(
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) {
    setInput(e.target.value);
  }

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: trimmed,
      };

      const nextMessages = [...messages, userMessage];
      const assistantId = generateId();

      setMessages([
        ...nextMessages,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: accumulated } : msg,
            ),
          );
        }

        onFinish?.();
      } catch (err) {
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantId));
        onError?.(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, isLoading, api, onError, onFinish],
  );

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleInputChange,
    handleSubmit,
  };
}
