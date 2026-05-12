import type { UIDataTypes, UIMessage } from "ai";
import { ChatTools } from "../ai/tools";

export type ChatMessageMetadata = {
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

export type ChatUIMessage = UIMessage<
  ChatMessageMetadata,
  UIDataTypes,
  ChatTools
>;

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant";
  parts: ChatUIMessage["parts"];
  metadata: ChatMessageMetadata | null;
  created_at: string;
}

export interface ChatBannerState {
  title: string;
  description: string;
}
