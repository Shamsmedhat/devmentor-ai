"use client";

import { useEffect, useRef } from "react";

import { Bot } from "lucide-react";

import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInputProvider,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import type { ChatAttachmentAddErrorCode } from "@/lib/constants/chat-attachments.constant";
import {
  saveChatMessageAction,
  updateSessionTitleAction,
} from "@/lib/actions/chat.action";
import { formatUserMessageForPersistence } from "@/lib/utils/chat-attachment.util";
import { useChatSession } from "@/hooks/chat/use-chat-session";
import { useChat, getMessageContent } from "@/hooks/chat/use-chat";
import type { ChatMessage } from "@/lib/types/chat";

import { ChatMessagesSkeleton } from "../../../skeletons/chat-messages-skeleton";

import ChatInput from "./chat-input";
import TypingIndicator from "./typing-indicator";
import { WelcomeScreen } from "./welcome-screen";

type SelectedSessionChangeOptions = { skipNavigation?: boolean };

interface ChatSessionPanelProps {
  initialMessages: ChatMessage[];
  /** True while history is being fetched for an existing session (e.g. locale switch). */
  isLoadingSessionMessages: boolean;
  selectedSessionId: string | null;
  onSelectedSessionIdChange: (
    id: string | null,
    options?: SelectedSessionChangeOptions,
  ) => void;
  onSyncChatSessionUrl: (sessionId: string) => void;
  errorMessage: string;
  attachmentErrorKeys: {
    too_many: string;
    too_large: string;
    type_not_allowed: string;
  };
  onTitleChange: (title: string) => void;
  onBannerError: (message: string | null) => void;
}

export default function ChatSessionPanel({
  initialMessages,
  isLoadingSessionMessages,
  selectedSessionId,
  onSelectedSessionIdChange,
  errorMessage,
  attachmentErrorKeys,
  onTitleChange,
  onBannerError,
  onSyncChatSessionUrl,
}: ChatSessionPanelProps) {
  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingSessionIdRef = useRef<Promise<string> | null>(null);

  // Hooks
  const { sessionId, createSession } = useChatSession(selectedSessionId);

  const { messages, status, isLoading, stop, sendMessage } = useChat({
    api: "/api/chat",
    initialMessages,
    onError: (err) => {
      // Don't show a banner for intentional aborts (session switch / unmount).
      if (err instanceof Error && err.name === "AbortError") return;
      onBannerError(errorMessage);
    },
    onFinish: async (message) => {
      onBannerError(null);
      const sidPromise = pendingSessionIdRef.current;
      if (!sidPromise) return;
      try {
        const sid = await sidPromise;
        onSyncChatSessionUrl(sid);
        void saveChatMessageAction({
          sessionId: sid,
          role: "assistant",
          content: message.content,
        }).catch((err) => {
          console.error(err);
        });
      } catch (err) {
        console.error(err);
      }
    },
  });

  // Variables
  const showTypingIndicator =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "user";

  // Functions
  function showAttachmentError(err: ChatAttachmentAddErrorCode) {
    const msg =
      err === "too_many"
        ? attachmentErrorKeys.too_many
        : err === "too_large"
          ? attachmentErrorKeys.too_large
          : attachmentErrorKeys.type_not_allowed;
    onBannerError(msg);
    setTimeout(() => onBannerError(null), 4000);
  }

  function handleSend(message: PromptInputMessage): void {
    const text = message.text.trim();
    const files = message.files;
    if ((!text && files.length === 0) || isLoading) return;

    const isFirstMessage = messages.length === 0;

    // Resolve session id without blocking the AI request. Existing sessions
    // resolve synchronously; new sessions create in parallel with the stream.
    const existingId = sessionId ?? selectedSessionId;
    const sidPromise: Promise<string> = existingId
      ? Promise.resolve(existingId)
      : createSession().then((id) => {
          onSelectedSessionIdChange(id, { skipNavigation: true });
          return id;
        });

    pendingSessionIdRef.current = sidPromise;

    // Fire AI request immediately. PromptInput auto-clears after onSubmit returns.
    void sendMessage({ text, files });

    // Background persistence — never blocks UI.
    void (async () => {
      try {
        const sid = await sidPromise;
        const persistedContent = await formatUserMessageForPersistence(
          text,
          files,
        );
        await saveChatMessageAction({
          sessionId: sid,
          role: "user",
          content: persistedContent,
        });
        if (isFirstMessage) {
          const titleSource =
            text || files[0]?.filename || persistedContent.slice(0, 40);
          await updateSessionTitleAction(sid, titleSource.slice(0, 40));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }

  // Effects
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === "user") {
      const text = getMessageContent(messages[0]).trim();
      const firstFilePart = messages[0].parts.find(
        (part) => part.type === "file",
      );
      const fallback =
        firstFilePart && firstFilePart.type === "file"
          ? (firstFilePart.filename ?? "")
          : "";
      const raw = text || fallback;
      const title = raw.slice(0, 40);
      onTitleChange(title.length < raw.length ? `${title}…` : title || "…");
    }
  }, [messages, onTitleChange]);

  return (
    <PromptInputProvider>
      {messages.length === 0 ? (
        isLoadingSessionMessages ? (
          <ChatMessagesSkeleton className="flex-1" />
        ) : (
          <WelcomeScreen inputRef={inputRef} />
        )
      ) : (
        <Conversation className="chat-scrollbar px-6 py-6">
          <ConversationContent className="mx-auto max-w-3xl">
            {messages.map((message) => {
              const hasFileParts = message.parts.some(
                (part) => part.type === "file",
              );
              return (
                <Message
                  from={message.role}
                  key={message.id}
                >
                  {message.role === "assistant" && (
                    <div className="mt-1 shrink-0 text-muted-foreground">
                      <Bot className="size-5" />
                    </div>
                  )}
                  <MessageContent className="text-base leading-relaxed">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return part.text ? (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        ) : null;
                      }
                      return null;
                    })}
                    {hasFileParts && (
                      <Attachments
                        className="mt-2 w-full"
                        variant="list"
                      >
                        {message.parts.map((part, i) => {
                          if (part.type !== "file") return null;
                          return (
                            <Attachment
                              key={`${message.id}-${i}`}
                              data={{
                                id: `${message.id}-${i}`,
                                type: "file",
                                filename: part.filename ?? "file",
                                mediaType: part.mediaType,
                                url: part.url,
                              }}
                            >
                              <AttachmentPreview />
                              <AttachmentInfo showMediaType />
                            </Attachment>
                          );
                        })}
                      </Attachments>
                    )}
                  </MessageContent>
                </Message>
              );
            })}

            {showTypingIndicator && <TypingIndicator />}
          </ConversationContent>
        </Conversation>
      )}

      <div className="mx-auto w-full max-w-3xl px-0">
        <ChatInput
          ref={inputRef}
          status={status}
          onSubmit={handleSend}
          onStop={stop}
          onPromptAttachmentError={showAttachmentError}
        />
      </div>
    </PromptInputProvider>
  );
}
