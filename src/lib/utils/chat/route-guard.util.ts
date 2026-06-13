import type { User } from "@supabase/supabase-js";

import { checkChatRateLimit } from "@/lib/ai/rate-limit";
import { getServerSupabaseAuth } from "@/lib/utils/auth/auth-server-guard";
import type { ChatStreamErrorPayload } from "@/lib/utils/chat/chat-stream-error.util";

type GuardSuccess = { ok: true; user: User };
type GuardFailure = { ok: false; response: Response };

/**
 * Validates env vars, authenticates the user, and checks the per-user rate
 * limit. Returns the authenticated `User` on success, or an early `Response`
 * the route handler can return immediately on failure.
 */
export async function guardChatRoute(): Promise<GuardSuccess | GuardFailure> {
  // Env checks - the active AI provider's key is checked by the route handler
  // itself (see `getActiveChatProvider` + `ACTIVE_CHAT_PROVIDER_ID`), so we
  // only verify Supabase config here.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      ok: false,
      response: new Response("Authentication is not configured", {
        status: 503,
      }),
    };
  }

  // Auth
  const { user } = await getServerSupabaseAuth();

  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Rate limit
  const rate = await checkChatRateLimit(user.id);

  if (!rate.ok && rate.reason === "over_limit") {
    // Same JSON envelope stream errors use: the transport surfaces the body as
    // `error.message`, so `parseChatStreamError` shows the rate-limit banner
    // instead of the generic one. No reset time is tracked, so no `retryAfter`.
    const body = JSON.stringify({
      kind: "rate-limit",
    } satisfies ChatStreamErrorPayload);

    return {
      ok: false,
      response: new Response(body, {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (!rate.ok && rate.reason === "check_failed") {
    return {
      ok: false,
      response: new Response("Rate limit check failed", { status: 503 }),
    };
  }

  return { ok: true, user };
}
