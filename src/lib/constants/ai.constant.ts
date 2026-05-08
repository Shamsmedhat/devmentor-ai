export const AI_LIMITS = {
  CHAT_MAX_TOKENS: 1000,
  REVIEW_MAX_TOKENS: 2000,
  SUMMARY_MAX_TOKENS: 500,
  CONTEXT_MAX_CHUNKS: 5,
  CONTEXT_MAX_CHARS: 3000,
  CHAT_MESSAGES_PER_HOUR: 50,
} as const;

/**
 * Used with `getModelAttachmentCapabilities` so file parts are either passed
 * through to the model or inlined as text. Align with the model wired in
 * `/api/chat` when you add providers (e.g. `google:gemini-2.5-flash`).
 */
export const CHAT_MODEL_CAPABILITY_KEY =
  process.env.CHAT_MODEL_CAPABILITY_KEY ?? "groq:llama-3.3-70b-versatile";

/** Default when `GOOGLE_GENERATIVE_AI_MODEL` is unset. Uses a distinct quota bucket from `gemini-2.0-flash`. */
export const DEFAULT_GOOGLE_CHAT_MODEL = "gemini-2.5-flash" as const;
