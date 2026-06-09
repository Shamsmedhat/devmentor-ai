"use client";

import { useRef } from "react";

import { useRouter } from "@/i18n/navigation";
import {
  createChatSessionAction,
  saveChatMessageAction,
  updateSessionTitleAction,
} from "@/lib/actions/chat.action";
import type { ChatUIMessage } from "@/lib/types/chat";
import { buildChatPath } from "@/lib/utils/chat/chat-navigation.util";
import { useChatUi } from "@/lib/context/chat-ui.context";

const TITLE_MAX_LENGTH = 40;

interface UseChatPersistenceResult {
  persistUserMessage: (text: string, isFirstMessage: boolean) => Promise<void>;
  persistAssistantMessage: (message: ChatUIMessage) => Promise<void>;
}

export function useChatPersistence(
  sessionId: string | null,
): UseChatPersistenceResult {
  // Navigation
  const router = useRouter();

  // Context
  const { setCurrentTitle } = useChatUi();

  // Refs - caches the in-flight session-creation promise so user + assistant
  // saves share the same id without firing two creates.
  const pendingSessionIdRef = useRef<Promise<string> | null>(null);

  // Variables
  const isExistingSession = Boolean(sessionId);

  // Functions
  function ensureSessionId(): Promise<string> {
    if (sessionId) return Promise.resolve(sessionId);
    if (!pendingSessionIdRef.current) {
      pendingSessionIdRef.current = createChatSessionAction("New Chat");
    }
    return pendingSessionIdRef.current;
  }

  async function persistUserMessage(
    text: string,
    isFirstMessage: boolean,
  ): Promise<void> {
    const sid = await ensureSessionId();

    await saveChatMessageAction({
      sessionId: sid,
      role: "user",
      parts: [{ type: "text", text }],
    });

    if (isFirstMessage) {
      const title = text.slice(0, TITLE_MAX_LENGTH);
      await updateSessionTitleAction(sid, title);
      setCurrentTitle(title);
    }
  }

  async function persistAssistantMessage(
    message: ChatUIMessage,
  ): Promise<void> {
    const sid = await ensureSessionId();

    await saveChatMessageAction({
      sessionId: sid,
      role: "assistant",
      parts: message.parts,
      metadata: message.metadata,
    });

    // Navigate after streaming finishes - replacing earlier would interrupt
    // the stream when RAGChatBot remounts on key change.
    if (!isExistingSession) {
      router.replace(buildChatPath(sid));
    }
  }

  return { persistUserMessage, persistAssistantMessage };
}
