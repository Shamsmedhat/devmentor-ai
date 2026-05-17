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
