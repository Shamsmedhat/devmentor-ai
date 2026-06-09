import { AI_LIMITS } from "@/lib/constants/ai.constant";
import { createAdminClient } from "@/lib/utils/supabase/admin";

type ChatRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "over_limit" }
  | { ok: false; reason: "check_failed" };

/**
 * Counts ACTUAL /api/chat requests for this user in the last hour via the
 * server-only `chat_request_log` table (RLS on, no policies → service-role
 * only). This counts requests, not persisted messages, so it can't be bypassed
 * by skipping `saveChatMessageAction`. Fail-closed: a count error denies.
 */
export async function checkChatRateLimit(
  userId: string,
): Promise<ChatRateLimitResult> {
  // Admin client - chat_request_log is locked down by RLS.
  const admin = createAdminClient();

  // One hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count this user's requests in the window
  const { count, error } = await admin
    .from("chat_request_log")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  // Fail-closed: deny on a count error
  if (error) {
    console.error(error);
    return { ok: false, reason: "check_failed" };
  }

  // Over the per-user limit
  if ((count ?? 0) >= AI_LIMITS.CHAT_REQUESTS_PER_HOUR) {
    return { ok: false, reason: "over_limit" };
  }

  return { ok: true };
}

/**
 * Best-effort: record one request row so it counts toward the next window check.
 * Never throws and never denies service - the count gate is the real limiter, so
 * a transient logging failure must not block chat. `ip` is stored for auditing;
 * it is not enforced (per-user only).
 */
export async function logChatRequest(
  userId: string,
  ip: string | null,
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("chat_request_log")
      .insert({ user_id: userId, ip });
    if (error) console.error("[rate-limit] failed to log chat request", error);
  } catch (error) {
    console.error("[rate-limit] failed to log chat request", error);
  }
}
