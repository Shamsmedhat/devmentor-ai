import { ChatBannerState, ChatUIMessage } from "@/lib/types/chat";
import { isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai";
import { parseChatStreamError } from "./chat-stream-error.util";

/** Hides the pre-token typing indicator once ANY assistant part is rendering -
 *  streamed text, a reasoning block, or a tool call all show their own UI. */
export function messageHasStreamingAssistantActivity(
  message: ChatUIMessage,
): boolean {
  return message.parts.some((part) => {
    if (isTextUIPart(part)) return part.text.length > 0;
    if (isToolUIPart(part)) return true;
    if (isReasoningUIPart(part)) return true;
    return false;
  });
}

/** Maps a streaming error into translated copy for the chat banner. */
export function buildChatErrorBanner(
  err: Error,
  t: (key: string, values?: Record<string, string | number>) => string,
): ChatBannerState {
  const payload = parseChatStreamError(err.message);

  if (payload.kind === "rate-limit") {
    return {
      title: t("chat-rate-limit-banner-title"),
      description: payload.retryAfter
        ? t("chat-rate-limit-banner-desc", { seconds: payload.retryAfter })
        : t("chat-rate-limit-banner-desc-generic"),
    };
  }

  return {
    title: t("chat-error-banner-title"),
    description: t("chat-error-banner-desc"),
  };
}
