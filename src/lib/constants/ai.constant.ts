export const AI_LIMITS = {
  CHAT_MAX_TOKENS: 3000,
  REVIEW_MAX_TOKENS: 2000,
  SUMMARY_MAX_TOKENS: 500,
  /** Cosine similarity floor for a knowledge-base chunk to count as a match. */
  RAG_SIMILARITY_THRESHOLD: 0.6,
  /** Max chunks returned by a single knowledge-base search. */
  RAG_MAX_RESULTS: 10,
  /** Texts per `embedMany` call. Keeps a single document under Gemini RPM. */
  EMBEDDING_BATCH_SIZE: 50,
  /** Pause between embedding batches in ms. Skipped after the final batch. */
  EMBEDDING_BATCH_DELAY_MS: 1000,
  /** Max /api/chat requests per user per hour. One row per request = one turn. */
  CHAT_REQUESTS_PER_HOUR: 30,
  /**
   * Max recent UIMessages sent to the model per turn. `messages[0]` is always
   * preserved by the active strategy. DB persistence is unaffected.
   */
  SLIDING_WINDOW_MESSAGES: 10,
  /** Target character length per transcribed-lecture chunk. */
  VIDEO_CHUNK_SIZE: 500,
  /** Words carried into the next chunk to preserve cross-chunk context. */
  VIDEO_CHUNK_OVERLAP_WORDS: 10,
} as const;
