import { createGroq } from "@ai-sdk/groq";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { type ModelMessage, streamText } from "ai";

import { NextResponse } from "next/server";

import { MENTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { checkChatRateLimit } from "@/lib/ai/rate-limit";
import {
  AI_LIMITS,
  // DEFAULT_GOOGLE_CHAT_MODEL,
} from "@/lib/constants/ai.constant";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  // Env variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // If the env variables are not set, return an error
  if (!supabaseUrl || !supabaseKey) {
    return new Response("Authentication is not configured", { status: 503 });
  }

  // If the google api key is not set, return an error
  if (!googleApiKey) {
    return new Response("AI is not configured", { status: 503 });
  }

  // Supabase
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Apply rate limiting only for authenticated users
  if (user) {
    // Check rate limit
    const rate = await checkChatRateLimit(user.id);

    // If the rate limit is exceeded, return an error
    if (!rate.ok && rate.reason === "over_limit") {
      return new Response("Too many requests", { status: 429 });
    }

    // If the rate limit check failed, return an error
    if (!rate.ok && rate.reason === "check_failed") {
      return new Response("Rate limit check failed", { status: 503 });
    }
  }

  // Get body
  // TODO: remove the unknown type
  const body: unknown = await request.json();

  // If the body is not valid, return an error
  if (
    !body ||
    typeof body !== "object" ||
    !("messages" in body) ||
    !Array.isArray((body as { messages: unknown }).messages)
  ) {
    // Return an error
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Get messages
  const messages = (body as { messages: ModelMessage[] }).messages;

  // const google = createGoogleGenerativeAI({
  //   apiKey: googleApiKey,
  // });

  // Create model
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });

  // Model id
  // const modelId =
  //   process.env.GOOGLE_GENERATIVE_AI_MODEL ?? DEFAULT_GOOGLE_CHAT_MODEL;

  // Stream text
  const result = streamText({
    // model: google(modelId),
    model: groq("llama-3.3-70b-versatile"),
    system: MENTOR_SYSTEM_PROMPT,
    messages,
    maxOutputTokens: AI_LIMITS.CHAT_MAX_TOKENS,
    // Retrying 429 quota errors wastes attempts and obscures the real failure.
    maxRetries: 0,
  });

  // Return text stream response
  return result.toTextStreamResponse();
}
