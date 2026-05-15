import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  smoothStream,
} from "ai";

import { buildRagSystemPrompt } from "@/lib/ai/rag";
import { modelTools } from "@/lib/ai/tools";
import { getModelAttachmentCapabilities } from "@/lib/ai/model-capabilities";
import { normalizeUiMessagesForAttachmentCapabilities } from "@/lib/ai/normalize-ui-messages-for-model";
import {
  AI_LIMITS,
  CHAT_MODEL_CAPABILITY_KEY,
} from "@/lib/constants/ai.constant";
import { guardChatRoute } from "@/lib/utils/chat/route-guard.util";
import { serializeChatStreamError } from "@/lib/utils/chat/chat-stream-error.util";
import type { ChatMessageMetadata, ChatUIMessage } from "@/lib/types/chat";
import { google } from "@ai-sdk/google";

export async function POST(request: Request): Promise<Response> {
  // Auth + rate limit
  const guard = await guardChatRoute();
  if (!guard.ok) return guard.response;

  // Body parsing (started concurrently with guard in the future if needed)
  const body = (await request.json()) as unknown;

  if (
    !body ||
    typeof body !== "object" ||
    !("messages" in body) ||
    !Array.isArray((body as { messages: unknown }).messages)
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = (body as { messages: ChatUIMessage[] }).messages;

  // RAG retrieval and message normalization run in parallel
  const caps = getModelAttachmentCapabilities(CHAT_MODEL_CAPABILITY_KEY);

  const [systemPrompt, modelMessages] = await Promise.all([
    buildRagSystemPrompt(messages),
    (async () => {
      const normalized = await normalizeUiMessagesForAttachmentCapabilities(
        messages,
        caps,
      );
      return convertToModelMessages(normalized);
    })(),
  ]);

  // Stream
  const result = streamText({
    model: google.chat("gemini-2.5-flash"),
    system: systemPrompt,
    tools: modelTools,
    messages: modelMessages,
    maxOutputTokens: AI_LIMITS.CHAT_MAX_TOKENS,
    maxRetries: 0,
    stopWhen: stepCountIs(5),

    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
  });

  console.log("result", result);

  // `messageMetadata` attaches per-turn details (finish reason + token usage)
  // that the client's MessageInsights block renders.
  // `onError` translates raw provider errors into a structured JSON payload
  // the client banner can parse — see `serializeChatStreamError`.
  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return {
          truncated: part.finishReason === "length",
          finishReason: part.finishReason,
          rawFinishReason: part.rawFinishReason,
          usage: {
            inputTokens: part.totalUsage?.inputTokens,
            outputTokens: part.totalUsage?.outputTokens,
            totalTokens: part.totalUsage?.totalTokens,
            reasoningTokens: part.totalUsage?.reasoningTokens,
          },
        } satisfies ChatMessageMetadata;
      }
    },
    onError: serializeChatStreamError,
  });
}
