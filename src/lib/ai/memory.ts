import type { UIMessage } from "ai";

import { AI_LIMITS } from "@/lib/constants/ai.constant";

/**
 * Pure function. Receives full history, returns subset to send to the model.
 * Generic over any `UIMessage` subtype so call sites keep their narrowed
 * metadata typing. Must not mutate input or have side effects.
 */
export type MemoryStrategy = <M extends UIMessage>(messages: M[]) => M[];

/**
 * Last N messages, no anchor. Cheapest option, loses early context.
 */
export function slidingWindow(
  limit: number = AI_LIMITS.SLIDING_WINDOW_MESSAGES,
): MemoryStrategy {
  return <M extends UIMessage>(messages: M[]): M[] => messages.slice(-limit);
}

/**
 * Last N messages, with `messages[0]` always preserved as anchor. Designed for
 * chats where the first message sets project context (stack, file structure,
 * task setup).
 */
export function slidingWindowWithAnchor(
  limit: number = AI_LIMITS.SLIDING_WINDOW_MESSAGES,
): MemoryStrategy {
  return <M extends UIMessage>(messages: M[]): M[] => {
    if (messages.length <= limit) return messages;
    return [messages[0], ...messages.slice(-(limit - 1))];
  };
}

/**
 * The active strategy used by /api/chat. To swap, change this single line -
 * no call sites need updating.
 */
export const memoryStrategy: MemoryStrategy = slidingWindowWithAnchor();
