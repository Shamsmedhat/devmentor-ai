import { groq } from "@ai-sdk/groq";

// import { createGoogleGenerativeAI } from "@ai-sdk/google";

import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  InferUITools,
  UIDataTypes,
  stepCountIs,
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
import { z } from "zod";
import { searchKnowledgeBase } from "@/lib/ai/search";

const tools = {
  knowledge_base_search: tool({
    description: "Search the knowledge base for information",
    inputSchema: z.object({
      query: z.string().describe("The query to search the knowledge base for"),
    }),
    execute: async ({ query }) => {
      try {
        const results = await searchKnowledgeBase(query, 10, 0.5);
        if (results.length === 0) {
          return "No results found";
        }

        const formattedResults = results
          .map((r, i) => `Result ${i + 1}: ${r.content}`)
          .join("\n\n");
        return formattedResults;
      } catch (error) {
        console.error(error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

function getLatestUserMessageText(messages: ChatMessage[]): string {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!lastUserMessage) {
    return "";
  }

  if (Array.isArray(lastUserMessage.parts)) {
    return lastUserMessage.parts
      .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
      .join("")
      .trim();
  }

  return "";
}

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

  // Kick off auth and body parsing concurrently — they don't depend on each other.
  const authPromise = getServerSupabaseAuth();
  const bodyPromise = request.json() as Promise<unknown>;

  const { user } = await authPromise;
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await checkChatRateLimit(user.id);
  if (!rate.ok && rate.reason === "over_limit") {
    return new Response("Too many requests", { status: 429 });
  }
  if (!rate.ok && rate.reason === "check_failed") {
    return new Response("Rate limit check failed", { status: 503 });
  }

  const body = await bodyPromise;
  if (
    !body ||
    typeof body !== "object" ||
    !("messages" in body) ||
    !Array.isArray((body as { messages: unknown }).messages)
  ) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = (body as { messages: ChatMessage[] }).messages;
  const retrievalQuery = getLatestUserMessageText(messages);
  const caps = getModelAttachmentCapabilities(CHAT_MODEL_CAPABILITY_KEY);

  // RAG retrieval and message normalization+conversion are independent — run in parallel.
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

  const retrievalContext = retrievalResults
    .map((result, index) => `Result ${index + 1}: ${result.content}`)
    .join("\n\n");
  const systemPrompt = retrievalContext
    ? RAG_SYSTEM_PROMPT(retrievalContext)
    : MENTOR_SYSTEM_PROMPT;

  // Stream text
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    tools,
    messages: modelMessages,
    maxOutputTokens: AI_LIMITS.CHAT_MAX_TOKENS,
    // Retrying 429 quota errors wastes attempts and obscures the real failure.
    maxRetries: 0,
    stopWhen: stepCountIs(2),
  });
  // useChat + DefaultChatTransport expects the UI message stream protocol.
  return result.toUIMessageStreamResponse();
}
