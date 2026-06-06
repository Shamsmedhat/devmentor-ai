import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  type StopCondition,
  type ToolSet,
} from "ai";

import { memoryStrategy } from "@/lib/ai/memory";
import { normalizeUiMessagesForAttachmentCapabilities } from "@/lib/ai/normalize-ui-messages-for-model";
import { getActiveChatProvider } from "@/lib/ai/providers";
import { buildRagSystemPrompt } from "@/lib/ai/rag";
import { logChatRequest } from "@/lib/ai/rate-limit";
import { AI_LIMITS } from "@/lib/constants/ai.constant";
import type { ChatMessageMetadata, ChatUIMessage } from "@/lib/types/chat";
import { serializeChatStreamError } from "@/lib/utils/chat/chat-stream-error.util";
import { guardChatRoute } from "@/lib/utils/chat/route-guard.util";

// First hop of x-forwarded-for, or null when unknown (e.g. local dev).
function getClientIp(request: Request): string | null {
  const first = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return first && first.length > 0 ? first : null;
}

export async function POST(request: Request): Promise<Response> {
  // Auth + rate limit
  const guard = await guardChatRoute();
  if (!guard.ok) return guard.response;

  // Body parsing
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

  // Active provider — switch by editing ACTIVE_CHAT_PROVIDER_ID in providers.ts
  const provider = getActiveChatProvider();

  if (!process.env[provider.apiKeyEnv]) {
    return new Response("Active AI provider is not configured", {
      status: 503,
    });
  }

  // Attachments are reshaped against THIS provider's capability profile;
  // image parts stay native on Gemini, get inlined as text on Groq.
  const normalized = await normalizeUiMessagesForAttachmentCapabilities(
    messages,
    provider.capabilities,
  );

  // Conversation memory — trim history before it hits the model. The active
  // strategy lives in `src/lib/ai/memory.ts` (one-line swap, like providers).
  const trimmed = memoryStrategy(normalized);

  // RAG retrieval (system prompt). Reads the latest user message, which the
  // memory strategy always preserves — safe to run against `trimmed`.
  const systemPrompt = await buildRagSystemPrompt(trimmed);

  const modelMessages = await convertToModelMessages(trimmed);

  // Rate-limit accounting: record THIS request so it counts toward the next
  // window check. Best-effort — never blocks the response (see logChatRequest).
  await logChatRequest(guard.user.id, getClientIp(request));

  const result = streamText({
    model: provider.createModel(),
    tools: provider.createTools(),
    system: systemPrompt,
    messages: modelMessages,
    maxOutputTokens: AI_LIMITS.CHAT_MAX_TOKENS,
    maxRetries: 0,
    stopWhen: stepCountIs(2) as StopCondition<ToolSet>,
    ...provider.streamOptions,
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
  });

  return result.toUIMessageStreamResponse<ChatUIMessage>({
    // `sendReasoning` defaults to TRUE in the AI SDK — Gemini would otherwise
    // ship its thinking block down the UI stream. Explicit false here is the
    // belt; providers.ts `thinkingConfig: { thinkingBudget: 0 }` is the braces.
    sendReasoning: false,
    messageMetadata: ({ part }) => {
      if (part.type !== "finish") return;
      return {
        provider: provider.id,
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
    },
    onError: serializeChatStreamError,
  });
}
