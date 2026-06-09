import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  type ProviderMetadata,
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
  const first = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
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

  // Active provider - switch by editing ACTIVE_CHAT_PROVIDER_ID in providers.ts
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

  // Conversation memory - trim history before it hits the model. The active
  // strategy lives in `src/lib/ai/memory.ts` (one-line swap, like providers).
  const trimmed = memoryStrategy(normalized);

  // RAG retrieval (system prompt + sources). Reads the latest user message,
  // which the memory strategy always preserves - safe to run against `trimmed`.
  // `ragSources` is known here (before streaming) so it can mount the KB step
  // in the insights panel from the very first metadata emit.
  const { system: systemPrompt, sources: ragSources } =
    await buildRagSystemPrompt(trimmed);

  const modelMessages = await convertToModelMessages(trimmed);

  // Rate-limit accounting: record THIS request so it counts toward the next
  // window check. Best-effort - never blocks the response (see logChatRequest).
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

  // Google Search grounding accumulators. The `messageMetadata` callback runs
  // for every stream part, but the data is split across parts: search queries
  // ride on `finish-step` providerMetadata (one per step), sources arrive as
  // standalone `source` parts. We collect across the whole stream - deduped -
  // and emit a fresh snapshot on each part so the UI updates live. The client
  // deep-merges each emission (arrays replace), so re-sending the full
  // accumulated grounding object every time is idempotent.
  const groundingQueries = new Set<string>();
  const groundingSources = new Map<string, { url: string; title?: string }>();

  // Current grounding, or undefined until the model actually runs a search.
  const groundingSnapshot = (): ChatMessageMetadata["grounding"] => {
    if (groundingQueries.size === 0 && groundingSources.size === 0) return;
    return {
      queries: [...groundingQueries],
      sources: [...groundingSources.values()],
    };
  };

  return result.toUIMessageStreamResponse<ChatUIMessage>({
    // `sendReasoning` defaults to TRUE in the AI SDK - Gemini would otherwise
    // ship its thinking block down the UI stream. Explicit false here is the
    // belt; providers.ts `thinkingConfig: { thinkingBudget: 0 }` is the braces.
    sendReasoning: false,
    messageMetadata: ({ part }) => {
      // Mount the panel as soon as the turn starts. RAG sources are known
      // upfront; emit them once here - later emits omit the key, so the
      // client's deep-merge keeps them through to the final metadata.
      if (part.type === "start") {
        return {
          provider: provider.id,
          ...(ragSources.length > 0 ? { rag: { sources: ragSources } } : {}),
        } satisfies ChatMessageMetadata;
      }

      // Dedupe sources by URL as they stream in, then push a live snapshot.
      if (part.type === "source" && part.sourceType === "url") {
        if (!groundingSources.has(part.url)) {
          groundingSources.set(part.url, { url: part.url, title: part.title });
        }
        return {
          provider: provider.id,
          grounding: groundingSnapshot(),
        } satisfies ChatMessageMetadata;
      }

      // Merge web-search queries from every step (deduped by text).
      if (part.type === "finish-step") {
        for (const query of readWebSearchQueries(part.providerMetadata)) {
          groundingQueries.add(query);
        }
        return {
          provider: provider.id,
          grounding: groundingSnapshot(),
        } satisfies ChatMessageMetadata;
      }

      if (part.type !== "finish") return;

      // Final metadata - tokens + finish reason land here (unchanged).
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
        grounding: groundingSnapshot(),
      } satisfies ChatMessageMetadata;
    },
    onError: serializeChatStreamError,
  });
}

// Pulls `google.groundingMetadata.webSearchQueries` out of a finish-step's
// provider metadata, narrowing the loosely-typed `ProviderMetadata` bag
// without `any`. Returns an empty array for non-Google / non-grounded steps.
function readWebSearchQueries(
  providerMetadata: ProviderMetadata | undefined,
): string[] {
  const grounding = providerMetadata?.google?.groundingMetadata;
  if (!grounding || typeof grounding !== "object") return [];

  const queries = (grounding as { webSearchQueries?: unknown })
    .webSearchQueries;
  if (!Array.isArray(queries)) return [];

  return queries.filter((q): q is string => typeof q === "string");
}
