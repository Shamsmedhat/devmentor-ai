import type { UIDataTypes, UIMessage } from "ai";

export type ChatMessageMetadata = {
  /** Identifier of the provider that produced this turn (e.g. `groq:openai/gpt-oss-20b`). */
  provider?: string;
  truncated?: boolean;
  finishReason?:
    | "stop"
    | "length"
    | "content-filter"
    | "tool-calls"
    | "error"
    | "other";
  rawFinishReason?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    reasoningTokens?: number;
  };
  /**
   * Google Search grounding — present only when grounding actually fired this
   * turn (Gemini provider with the `googleSearch` tool). Absent on plain RAG
   * turns and on providers without web search.
   */
  grounding?: {
    queries: string[];
    sources: { url: string; title?: string }[];
  };
  /**
   * Knowledge-base (RAG) sources retrieved for this turn. Present only when
   * retrieval returned chunks above threshold — absent when nothing matched.
   */
  rag?: {
    sources: RagSource[];
  };
};

/** A single knowledge-base chunk surfaced in the insights panel (sources, not text). */
export type RagSource = {
  /** Stable chunk id — used as a render key. */
  id: string;
  /** Document name / video title / "unknown". */
  label: string;
  /** "video" | "pdf" | "text" | … when known. */
  sourceType?: string;
  /** Cosine similarity in [0, 1]. */
  similarity: number;
  /** Drive URL for video sources (when present). */
  url?: string;
  /** "H:MM:SS" start timestamp for video sources. */
  timestamp?: string;
};

export type ChatUIMessage = UIMessage<ChatMessageMetadata, UIDataTypes>;

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatBannerState {
  title: string;
  description: string;
}
