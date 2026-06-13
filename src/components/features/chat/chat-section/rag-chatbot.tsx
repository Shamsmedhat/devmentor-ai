"use client";

import { useState } from "react";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
} from "ai";
import { MessageSquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

import { useChatPersistence } from "@/hooks/chat/use-chat-persistence";
import type { ChatBannerState, ChatUIMessage } from "@/lib/types/chat";
import TextPart from "./text-part";
import ReasoningPart from "./reasoning-part";
import ToolPart from "./tool-part";
import MessageInsights from "./message-insights";
import ChatBanner from "./chat-banner";
import TypingIndicator from "./typing-indicator";
import {
  buildChatErrorBanner,
  messageHasStreamingAssistantActivity,
} from "@/lib/utils/chat/helpers";
import DisplayUsedTokens from "./display-used-tokens";

interface RAGChatBotProps {
  sessionId: string | null;
  initialMessages: ChatUIMessage[];
  isArabicResponse: boolean;
}

export default function RAGChatBot({
  sessionId,
  initialMessages,
  isArabicResponse,
}: RAGChatBotProps) {
  // Translation
  const t = useTranslations();

  // State
  const [chatError, setChatError] = useState<ChatBannerState | null>(null);

  // Hooks
  const { persistUserMessage, persistAssistantMessage } =
    useChatPersistence(sessionId);

  const { messages, sendMessage, status, stop } = useChat<ChatUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: initialMessages,
    onError: (err) => {
      if (err.name === "AbortError") return;
      setChatError(buildChatErrorBanner(err, t));
    },
    // On finish, persist the assistant message.
    onFinish: ({ message }) => {
      if (message.role !== "assistant") return;
      // Stopped before any renderable part - nothing worth persisting.
      // Intentionally shares the typing-indicator helper so the two
      // definitions of "has visible content" never fork.
      if (!messageHasStreamingAssistantActivity(message)) return;
      void persistAssistantMessage(message).catch((persistErr) => {
        console.error(persistErr);
      });
    },
  });

  // Variables
  const isGenerating = status === "submitted" || status === "streaming";
  const lastMessage = messages.at(-1);
  // The assistant turn currently streaming - drives the live insights panel.
  const streamingAssistantId =
    isGenerating && lastMessage?.role === "assistant" ? lastMessage.id : null;
  const showTypingIndicator =
    isGenerating &&
    !(
      lastMessage?.role === "assistant" &&
      messageHasStreamingAssistantActivity(lastMessage)
    );
  const showTruncatedBanner =
    lastMessage?.role === "assistant" &&
    Boolean(lastMessage.metadata?.truncated);
  // Token strip waits for real usage numbers - they only land on `finish`,
  // so it never flashes 0/0/0 while the turn is still streaming.
  const lastUsage = lastMessage?.metadata?.usage;
  const showInsights =
    lastMessage?.role === "assistant" &&
    Boolean(
      lastUsage?.inputTokens || lastUsage?.outputTokens || lastUsage?.totalTokens,
    );

  // Functions
  function handleSubmit(message: PromptInputMessage) {
    // Enter mid-stream re-submits the form; drop it while a turn is running.
    // `status === "error"` still submits so the user can retry after a failure.
    if (isGenerating) return;

    const text = message.text.trim();
    if (!text) return;

    // Sending a new message clears any banner left over from the previous turn.
    setChatError(null);

    const isFirstMessage = messages.length === 0;

    // Fire AI immediately, persist the user message in the background.
    void persistUserMessage(text, isFirstMessage).catch((err) => {
      console.error(err);
    });

    // Fire AI request immediately. PromptInput auto-clears after onSubmit returns.
    sendMessage({ text });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <Conversation
          className="h-full"
          initial="instant"
          dir={isArabicResponse ? "rtl" : "ltr"}
        >
          <ConversationContent
            className={messages.length === 0 ? "h-full" : undefined}
          >
            {messages.length === 0 && (
              <ConversationEmptyState
                icon={<MessageSquareIcon className="size-8" />}
                title={t("chat-welcome-title")}
                description={t("chat-welcome-subtitle")}
              />
            )}
            {messages.map((message) => {
              const isStreaming = message.id === streamingAssistantId;

              return (
                <div key={message.id}>
                  {message.role === "assistant" &&
                    (message.metadata || isStreaming) && (
                      <MessageInsights
                        metadata={message.metadata}
                        isStreaming={isStreaming}
                      />
                    )}

                  {message.parts.map((part, i) => {
                    // Text part
                    if (isTextUIPart(part))
                      return (
                        <TextPart
                          key={`${message.id}-${i}`}
                          message={message}
                          part={part}
                        />
                      );

                    // Reasoning part
                    if (isReasoningUIPart(part))
                      return (
                        <ReasoningPart
                          key={`${message.id}-${i}`}
                          message={message}
                          part={part}
                        />
                      );

                    // Tool part
                    if (isToolUIPart(part)) {
                      return (
                        <ToolPart
                          key={`${message.id}-${i}`}
                          message={message}
                          part={part}
                        />
                      );
                    }

                    return null;
                  })}
                </div>
              );
            })}
            {showTypingIndicator && <TypingIndicator />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Error / truncated banner - error takes priority */}
        {chatError ? (
          <ChatBanner
            title={chatError.title}
            description={chatError.description}
          />
        ) : showTruncatedBanner ? (
          <ChatBanner
            title={t("chat-truncated-banner-title")}
            description={t("chat-truncated-banner-desc")}
          />
        ) : null}

        {/* Display tokens for user */}
        <DisplayUsedTokens
          showInsights={showInsights}
          lastMessage={lastMessage as ChatUIMessage}
        />

        {/* Chat input */}
        <PromptInput onSubmit={handleSubmit}>
          {/* Input body */}
          <PromptInputBody>
            {/* Textarea */}
            <PromptInputTextarea placeholder={t("chat-placeholder")} />
          </PromptInputBody>

          {/* Footer */}
          <PromptInputFooter>
            {/* Tools */}
            <PromptInputTools />

            {/* Submit button */}
            <PromptInputSubmit
              status={status}
              onStop={stop}
              aria-label={
                isGenerating
                  ? t("chat-stop-generating")
                  : t("chat-input-send-aria")
              }
              className="cursor-pointer"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {t("chat-ai-disclaimer")}
      </p>
    </div>
  );
}
