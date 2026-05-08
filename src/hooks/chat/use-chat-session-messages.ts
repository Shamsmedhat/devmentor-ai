"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { getChatMessagesAction } from "@/lib/actions/chat.action";
import type { ChatMessage } from "@/lib/types/chat";

export function useChatSessionMessages(selectedSessionId: string | null): {
  loadedMessages: ChatMessage[];
  panelKey: number;
  isLoadingSessionMessages: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  markSyncingFromCreate: () => void;
} {
  // Translation
  const t = useTranslations();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<ChatMessage[]>([]);
  const [panelKey, setPanelKey] = useState(0);
  const [isLoadingSessionMessages, setIsLoadingSessionMessages] = useState(
    () => Boolean(selectedSessionId),
  );

  // Refs
  const syncingFromCreateRef = useRef(false);
  const skipFirstNullClearRef = useRef(true);
  const skipDuplicateCreateFetchRef = useRef<string | null>(null);

  // Functions
  function markSyncingFromCreate(): void {
    syncingFromCreateRef.current = true;
  }

  // Effects
  useEffect(() => {
    if (selectedSessionId === null) {
      const skipClear = skipFirstNullClearRef.current;
      skipFirstNullClearRef.current = false;

      void Promise.resolve().then(() => {
        setIsLoadingSessionMessages(false);
        if (skipClear) return;
        setLoadedMessages([]);
        setPanelKey((k) => k + 1);
      });
      return;
    }

    if (syncingFromCreateRef.current) {
      syncingFromCreateRef.current = false;
      if (selectedSessionId) {
        skipDuplicateCreateFetchRef.current = selectedSessionId;
      }
      void Promise.resolve().then(() => {
        setIsLoadingSessionMessages(false);
      });
      return;
    }

    if (
      selectedSessionId &&
      skipDuplicateCreateFetchRef.current === selectedSessionId
    ) {
      skipDuplicateCreateFetchRef.current = null;
      void Promise.resolve().then(() => {
        setIsLoadingSessionMessages(false);
      });
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingSessionMessages(true);
      try {
        const rows = await getChatMessagesAction(selectedSessionId);
        if (cancelled) return;
        setLoadedMessages(rows);
        setPanelKey((k) => k + 1);
      } catch {
        if (!cancelled) {
          setErrorMessage(tRef.current("chat-error"));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSessionMessages(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSessionId]);

  return {
    loadedMessages,
    panelKey,
    isLoadingSessionMessages,
    errorMessage,
    setErrorMessage,
    markSyncingFromCreate,
  };
}
