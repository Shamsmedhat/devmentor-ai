export const AI_LIMITS = {
  CHAT_MAX_TOKENS: 3000,
  REVIEW_MAX_TOKENS: 2000,
  SUMMARY_MAX_TOKENS: 500,
  CONTEXT_MAX_CHUNKS: 5,
  CONTEXT_MAX_CHARS: 3000,
  CHAT_MESSAGES_PER_HOUR: 50,
  /**
   * Max recent UIMessages sent to the model per turn. `messages[0]` is always
   * preserved by the active strategy. DB persistence is unaffected.
   */
  SLIDING_WINDOW_MESSAGES: 10,
} as const;
