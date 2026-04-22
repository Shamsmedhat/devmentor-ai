"use client";

import { useEffect, useRef, useState } from "react";

import { useLocale, useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/chat/use-chat";

import { ChatInput } from "./chat-input";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { SidebarToggle } from "./sidebar-toggle";
import { WelcomeScreen } from "./welcome-screen";

interface ChatAreaProps {
  currentTitle: string;
  onTitleChange: (title: string) => void;
  onSidebarToggle: () => void;
}

export function ChatArea({
  currentTitle,
  onTitleChange,
  onSidebarToggle,
}: ChatAreaProps) {
  // Translation
  const t = useTranslations();

  // Navigation
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  // State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Chat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/chat",
    onError: () => {
      setErrorMessage(t("chat-error"));
    },
    onFinish: () => {
      setErrorMessage(null);
    },
  });

  // Variables
  const showTypingIndicator =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "user";

  // Functions
  function handleScroll() {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distFromBottom < 120;
  }

  function handleAttachClick() {
    setErrorMessage(t("chat-attach-soon"));
    setTimeout(() => setErrorMessage(null), 3000);
  }

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  // Effects
  useEffect(() => {
    if (messages.length > 0 && isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "user") {
      const title = messages[0].content.slice(0, 40);
      onTitleChange(
        title.length < messages[0].content.length ? `${title}…` : title,
      );
    }
  }, [messages, onTitleChange]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-white/5 px-6">
        <div className="flex items-center gap-3">
          <SidebarToggle onClick={onSidebarToggle} />
          <span className="text-sm font-medium text-white/70">
            {currentTitle}
          </span>
        </div>

        {/* Locale toggle */}
        <div className="flex items-center rounded-full border border-white/6 bg-white/4 p-0.5">
          {(["ar", "en"] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-all",
                locale === loc
                  ? "bg-white/8 text-white"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              {loc === "ar" ? "AR" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {/* Error banner */}
      {errorMessage && (
        <div className="mx-4 mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Messages or Welcome */}
      {messages.length === 0 ? (
        <WelcomeScreen
          setInput={setInput}
          inputRef={inputRef}
        />
      ) : (
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="chat-scrollbar flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}

            {/* Streaming typing indicator */}
            {showTypingIndicator && <TypingIndicator />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Chat input */}
      <div className="mx-auto w-full max-w-3xl px-0">
        <ChatInput
          ref={inputRef}
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onAttachClick={handleAttachClick}
        />
      </div>
    </div>
  );
}
