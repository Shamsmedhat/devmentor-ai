"use client";

import { forwardRef, useCallback, type FormEvent } from "react";

import { useTranslations } from "next-intl";
import type { ChatStatus } from "ai";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  CHAT_ATTACHMENT_ACCEPT,
  CHAT_ATTACHMENT_IMAGE_MAX_BYTES,
  CHAT_ATTACHMENT_MAX_FILES,
  type ChatAttachmentAddErrorCode,
} from "@/lib/constants/chat-attachments.constant";

import PromptInputAttachmentsDisplay from "./prompt-input-attachments-display";

interface ChatInputProps {
  status: ChatStatus;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  onStop: () => void;
  onPromptAttachmentError?: (code: ChatAttachmentAddErrorCode) => void;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput(
    { status, onSubmit, onStop, onPromptAttachmentError },
    ref,
  ) {
    // Translation
    const t = useTranslations();

    // Functions
    const handlePromptError = useCallback(
      (err: {
        code: "max_files" | "max_file_size" | "accept";
        message: string;
      }) => {
        if (!onPromptAttachmentError) {
          return;
        }
        const code: ChatAttachmentAddErrorCode =
          err.code === "max_files"
            ? "too_many"
            : err.code === "max_file_size"
              ? "too_large"
              : "type_not_allowed";
        onPromptAttachmentError(code);
      },
      [onPromptAttachmentError],
    );

    return (
      <div className="flex flex-col gap-2">
        <PromptInput
          accept={CHAT_ATTACHMENT_ACCEPT}
          globalDrop
          maxFileSize={CHAT_ATTACHMENT_IMAGE_MAX_BYTES}
          maxFiles={CHAT_ATTACHMENT_MAX_FILES}
          multiple
          onError={onPromptAttachmentError ? handlePromptError : undefined}
          onSubmit={onSubmit}
        >
          <PromptInputAttachmentsDisplay />
          <PromptInputBody>
            <PromptInputTextarea
              ref={ref}
              dir="auto"
              placeholder={t("chat-placeholder")}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments
                    label={t("chat-attach-file")}
                  />
                  <PromptInputActionAddScreenshot />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit
              onStop={onStop}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>

        <p className="text-muted-foreground px-1 text-center text-xs">
          {t("chat-ai-disclaimer")}
        </p>
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
