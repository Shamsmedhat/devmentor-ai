"use client";

import { useCallback, useEffect, useState } from "react";

import { createChatSessionAction } from "@/lib/actions/chat.action";

export function useChatSession(selectedSessionId: string | null): {
  sessionId: string | null;
  createSession: () => Promise<string>;
} {
  const [sessionId, setSessionId] = useState<string | null>(selectedSessionId);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setSessionId(selectedSessionId);
    });
  }, [selectedSessionId]);

  const createSession = useCallback(async (): Promise<string> => {
    const id = await createChatSessionAction("New Chat");
    setSessionId(id);
    return id;
  }, []);

  return { sessionId, createSession };
}
