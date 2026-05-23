export const AI_LIMITS = {
  CHAT_MAX_TOKENS: 3000,
  REVIEW_MAX_TOKENS: 2000,
  SUMMARY_MAX_TOKENS: 500,
  /** Cosine similarity floor for a knowledge-base chunk to count as a match. */
  RAG_SIMILARITY_THRESHOLD: 0.5,
  /** Max chunks returned by a single knowledge-base search. */
  RAG_MAX_RESULTS: 10,
  /** Texts per `embedMany` call. Keeps a single document under Gemini RPM. */
  EMBEDDING_BATCH_SIZE: 50,
  /** Pause between embedding batches in ms. Skipped after the final batch. */
  EMBEDDING_BATCH_DELAY_MS: 1000,
  CHAT_MESSAGES_PER_HOUR: 50,
  /**
   * Max recent UIMessages sent to the model per turn. `messages[0]` is always
   * preserved by the active strategy. DB persistence is unaffected.
   */
  SLIDING_WINDOW_MESSAGES: 10,
} as const;
