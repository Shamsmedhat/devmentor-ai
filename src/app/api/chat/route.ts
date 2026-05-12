import { groq } from "@ai-sdk/groq";

import {
  convertToModelMessages,
  streamText,
  UIMessage,
  UIDataTypes,
  stepCountIs,
  smoothStream,
} from "ai";

import { MENTOR_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { checkChatRateLimit } from "@/lib/ai/rate-limit";
import { getModelAttachmentCapabilities } from "@/lib/ai/model-capabilities";
import { normalizeUiMessagesForAttachmentCapabilities } from "@/lib/ai/normalize-ui-messages-for-model";
import {
  AI_LIMITS,
  CHAT_MODEL_CAPABILITY_KEY,
  // DEFAULT_GOOGLE_CHAT_MODEL,
} from "@/lib/constants/ai.constant";
import { getServerSupabaseAuth } from "@/lib/utils/auth/auth-server-guard";
import { searchKnowledgeBase } from "@/lib/ai/search";
import { ChatTools, modelTools } from "@/lib/ai/tools";
import { getLatestUserMessageText } from "@/lib/ai/helpers";
import { serializeChatStreamError } from "@/lib/utils/chat/chat-stream-error.util";
import type { ChatMessageMetadata } from "@/lib/types/chat";

export type ChatMessage = UIMessage<
  ChatMessageMetadata,
  UIDataTypes,
  ChatTools
>;

export async function POST(request: Request) {
  // Variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  // If the env variables are not set, return an error
  if (!supabaseUrl || !supabaseKey) {
    return new Response("Authentication is not configured", { status: 503 });
  }

  // If the model provider key is not set, return an error
  if (!groqApiKey) {
    return new Response("AI is not configured", { status: 503 });
  }

  // start auth and body parsing concurrently, they don't depend on each other.
  const authPromise = getServerSupabaseAuth();
  const bodyPromise = request.json() as Promise<unknown>;

  const { user } = await authPromise;

  // If the user is not authenticated, return an error
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check the chat rate limit
  const rate = await checkChatRateLimit(user.id);

  // If the rate limit is exceeded, return an error
  if (!rate.ok && rate.reason === "over_limit") {
    return new Response("Too many requests", { status: 429 });
  }

  // If the rate limit check failed, return an error
  if (!rate.ok && rate.reason === "check_failed") {
    return new Response("Rate limit check failed", { status: 503 });
  }

  // Parse the body
  const body = await bodyPromise;

  // If the body is not valid, return an error
  if (
    !body ||
    typeof body !== "object" ||
    !("messages" in body) ||
    !Array.isArray((body as { messages: unknown }).messages)
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Get the messages from the body
  const messages = (body as { messages: ChatMessage[] }).messages;

  // Get the latest user message text
  const retrievalQuery = getLatestUserMessageText(messages);

  // Get the model attachment capabilities
  const caps = getModelAttachmentCapabilities(CHAT_MODEL_CAPABILITY_KEY);

  // RAG retrieval and message normalization+conversion are independent, run in parallel.
  const [retrievalResults, modelMessages] = await Promise.all([
    retrievalQuery
      ? searchKnowledgeBase(retrievalQuery, 10, 0.5)
      : Promise.resolve([] as Awaited<ReturnType<typeof searchKnowledgeBase>>),
    (async () => {
      const normalized = await normalizeUiMessagesForAttachmentCapabilities(
        messages,
        caps,
      );
      return convertToModelMessages(normalized);
    })(),
  ]);

  // Get the retrieval context
  const retrievalContext = retrievalResults
    .map((result, index) => `Result ${index + 1}: ${result.content}`)
    .join("\n\n");

  // Get the system prompt
  const systemPrompt = retrievalContext
    ? RAG_SYSTEM_PROMPT(retrievalContext)
    : MENTOR_SYSTEM_PROMPT;

  // Stream text using the model, tools, messages, max output tokens, max retries, stop when, experimental transform
  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: systemPrompt,
    tools: modelTools,
    messages: modelMessages,
    maxOutputTokens: AI_LIMITS.CHAT_MAX_TOKENS,
    // Retrying 429 quota errors wastes attempts and obscures the real failure.
    maxRetries: 0,
    stopWhen: stepCountIs(5),
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "word",
    }),
  });

  // useChat + DefaultChatTransport expects the UI message stream protocol.
  // `messageMetadata` attaches per-turn details (finish reason + token usage) to
  // each assistant message. They ride through `message.metadata`, get persisted,
  // and feed the MessageInsights chain-of-thought block on the client.
  // `onError` translates the raw provider error (which the SDK would otherwise
  // hide behind a generic "An error occurred." message) into a structured JSON
  // payload the client banner can render — see `serializeChatStreamError`.
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
