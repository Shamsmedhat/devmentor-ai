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

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

import { useChatPersistence } from "@/hooks/chat/use-chat-persistence";
import { useChatUi } from "@/lib/context/chat-ui.context";
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
}

export default function RAGChatBot({
  sessionId,
  initialMessages,
}: RAGChatBotProps) {
  // Translation
  const t = useTranslations();

  // Context
  const { isArabicResponse } = useChatUi();

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
      lastUsage?.inputTokens ||
      lastUsage?.outputTokens ||
      lastUsage?.totalTokens,
    );

  // Functions
  // Single send path - shared by the input form and the empty-state chips.
  function sendText(rawText: string) {
    // Drop while a turn is running; `status === "error"` still sends so the
    // user can retry after a failure.
    if (isGenerating) return;

    const text = rawText.trim();
    if (!text) return;

    // Sending a new message clears any banner left over from the previous turn.
    setChatError(null);

    const isFirstMessage = messages.length === 0;

    // Fire AI immediately, persist the user message in the background.
    void persistUserMessage(text, isFirstMessage).catch((err) => {
      console.error(err);
    });

    // PromptInput auto-clears after onSubmit returns.
    sendMessage({ text });
  }

  function handleSubmit(message: PromptInputMessage) {
    sendText(message.text);
  }

  return (
    <div className="relative mx-auto flex w-full max-w-4xl min-h-0 flex-1 flex-col p-6">
      <Conversation
        className="min-h-0 flex-1"
        initial="instant"
        dir={isArabicResponse ? "rtl" : "ltr"}
      >
        <ConversationContent
          className={messages.length === 0 ? "h-full" : undefined}
        >
          {messages.length === 0 && (
            <ConversationEmptyState>
              <MessageSquareIcon className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="text-sm font-medium">
                  {t("chat-welcome-title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("chat-welcome-subtitle")}
                </p>
              </div>
              <Suggestions className="mt-2 max-w-md justify-center">
                <Suggestion
                  suggestion={t("chat-suggestion-1")}
                  onClick={sendText}
                />
                <Suggestion
                  suggestion={t("chat-suggestion-2")}
                  onClick={sendText}
                />
                <Suggestion
                  suggestion={t("chat-suggestion-3")}
                  onClick={sendText}
                />
              </Suggestions>
            </ConversationEmptyState>
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

      <p className="mt-2 text-center text-xs text-muted-foreground">
        {t("chat-ai-disclaimer")}
      </p>
    </div>
  );
}
