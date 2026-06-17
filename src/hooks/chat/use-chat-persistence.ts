"use client";

import { useRef } from "react";

import { useLocale } from "next-intl";

import {
  createChatSessionAction,
  saveChatMessageAction,
  updateSessionTitleAction,
} from "@/lib/actions/chat.action";
import type { ChatUIMessage } from "@/lib/types/chat";
import { useChatUi } from "@/lib/context/chat-ui.context";

const TITLE_MAX_LENGTH = 40;

interface UseChatPersistenceResult {
  persistUserMessage: (text: string, isFirstMessage: boolean) => Promise<void>;
  persistAssistantMessage: (message: ChatUIMessage) => Promise<void>;
}

export function useChatPersistence(
  sessionId: string | null,
): UseChatPersistenceResult {
  // Translation
  const locale = useLocale();

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

    // Sync the URL after streaming finishes without a route navigation -
    // a real navigation would remount RAGChatBot (key change) and wipe the
    // messages we just streamed. A refresh still loads the session by URL.
    if (!isExistingSession) {
      window.history.replaceState(null, "", `/${locale}/chat/${sid}`);
    }
  }

  return { persistUserMessage, persistAssistantMessage };
}
