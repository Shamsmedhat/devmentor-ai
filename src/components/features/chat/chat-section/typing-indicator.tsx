"use client";

import { Bot } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";

/**
 * Bouncing-dots placeholder for the gap between submit and the first
 * assistant token. Once tokens arrive, the assistant message bubble
 * takes over and this component should be unmounted by the caller.
 */
export default function TypingIndicator() {
  // Translation
  const t = useTranslations();

  return (
    <Message
      from="assistant"
      role="status"
      aria-label={t("chat-typing-aria")}
    >
      <div className="mt-1 shrink-0 text-muted-foreground">
        <Bot className="size-5" />
      </div>
      <MessageContent className="rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
        </div>
      </MessageContent>
    </Message>
  );
}
