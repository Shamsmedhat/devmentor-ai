"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// New chats have no title - identity lives in the header BrandMark, not here.
// A real title is set on the first message (see useChatPersistence).
const DEFAULT_CHAT_TITLE = "";

interface ChatUiProviderProps {
  initialTitle?: string;
  children: ReactNode;
}

interface ChatUiContextValue {
  currentTitle: string;
  setCurrentTitle: (title: string) => void;
  isArabicResponse: boolean;
  setIsArabicResponse: (isArabicResponse: boolean) => void;
}

const ChatUiContext = createContext<ChatUiContextValue | null>(null);

export function ChatUiProvider({
  initialTitle = DEFAULT_CHAT_TITLE,
  children,
}: ChatUiProviderProps) {
  // State
  const [currentTitle, setCurrentTitle] = useState<string>(initialTitle);
  const [isArabicResponse, setIsArabicResponse] = useState<boolean>(false);

  return (
    <ChatUiContext.Provider
      value={{
        currentTitle,
        setCurrentTitle,
        isArabicResponse,
        setIsArabicResponse,
      }}
    >
      {children}
    </ChatUiContext.Provider>
  );
}

export function useChatUi(): ChatUiContextValue {
  const context = useContext(ChatUiContext);

  if (!context) {
    throw new Error("useChatUi must be used within ChatUiProvider");
  }

  return context;
}
