import type { ChatUIMessage } from "@/lib/types/chat";
/**
 * Helper function to get the latest user message text
 * @param messages - The messages to get the latest user message text from
 * @returns The latest user message text
 *
 */
export function getLatestUserMessageText(messages: ChatUIMessage[]): string {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!lastUserMessage) {
    return "";
  }

  if (Array.isArray(lastUserMessage.parts)) {
    return lastUserMessage.parts
      .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
      .join("")
      .trim();
  }

  return "";
}
