import { ChatBannerState, ChatUIMessage } from "@/lib/types/chat";
import { isReasoningUIPart, isToolUIPart } from "ai";
import { parseChatStreamError } from "./chat-stream-error.util";

/** Hides the generic spinner when tool or reasoning UI already shows in-flight work. */
export function messageHasStreamingAssistantActivity(
  message: ChatUIMessage,
): boolean {
  return message.parts.some((part) => {
    if (isToolUIPart(part)) {
      return (
        part.state === "input-available" || part.state === "input-streaming"
      );
    }
    if (isReasoningUIPart(part)) {
      return part.state === "streaming";
    }
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
