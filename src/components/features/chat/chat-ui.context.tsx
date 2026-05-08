"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { useRouter } from "@/i18n/navigation";
import type { ChatSession } from "@/lib/types/chat";
import { navigateToChatPath } from "@/lib/utils/chat/chat-navigation.util";

const DEFAULT_CHAT_TITLE = "DevMentor AI";

type SelectedSessionChangeOptions = { skipNavigation?: boolean };

interface ChatUiProviderProps {
  initialSessions: ChatSession[];
  initialSessionId?: string | null;
  children: ReactNode;
}

interface ChatUiContextValue {
  selectedSessionId: string | null;
  currentTitle: string;
  setCurrentTitle: (title: string) => void;
  selectSession: (session: ChatSession) => void;
  startNewChat: () => void;
  handleSelectedSessionIdChange: (
    id: string | null,
    options?: SelectedSessionChangeOptions,
  ) => void;
}

const ChatUiContext = createContext<ChatUiContextValue | null>(null);

function resolveSessionTitle(
  sessions: ChatSession[],
  sessionId: string | null,
): string {
  if (!sessionId) return DEFAULT_CHAT_TITLE;
  const match = sessions.find((session) => session.id === sessionId);

  return match?.title ?? DEFAULT_CHAT_TITLE;
}

export function ChatUiProvider({
  initialSessions,
  initialSessionId = null,
  children,
}: ChatUiProviderProps) {
  // Navigation
  const router = useRouter();

  // State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    initialSessionId,
  );
  const [currentTitle, setCurrentTitle] = useState<string>(
    resolveSessionTitle(initialSessions, initialSessionId),
  );

  // Functions
  function selectSession(session: ChatSession): void {
    setSelectedSessionId(session.id);
    setCurrentTitle(session.title);
    navigateToChatPath({ sessionId: session.id, router });
  }

  function startNewChat(): void {
    setSelectedSessionId(null);
    setCurrentTitle(DEFAULT_CHAT_TITLE);
    navigateToChatPath({ sessionId: null, router });
  }

  function handleSelectedSessionIdChange(
    id: string | null,
    options?: SelectedSessionChangeOptions,
  ): void {
    if (!id) {
      startNewChat();
      return;
    }

    setSelectedSessionId(id);
    if (!options?.skipNavigation) {
      navigateToChatPath({ sessionId: id, router });
    }
  }

  const value: ChatUiContextValue = {
    selectedSessionId,
    currentTitle,
    setCurrentTitle,
    selectSession,
    startNewChat,
    handleSelectedSessionIdChange,
  };

  return (
    <ChatUiContext.Provider value={value}>{children}</ChatUiContext.Provider>
  );
}

export function useChatUi(): ChatUiContextValue {
  const context = useContext(ChatUiContext);

  if (!context) {
    throw new Error("useChatUi must be used within ChatUiProvider");
  }

  return context;
}
