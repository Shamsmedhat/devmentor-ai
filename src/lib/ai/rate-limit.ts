import { AI_LIMITS } from "@/lib/constants/ai.constant";
import { createClient } from "@/utils/supabase/server";

export type ChatRateLimitResult =
  | { ok: true }
  | { ok: false; reason: "over_limit" }
  | { ok: false; reason: "check_failed" };

export async function checkChatRateLimit(
  userId: string,
): Promise<ChatRateLimitResult> {
  // Supabase
  const supabase = await createClient();

  // One hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Count chat messages in the last hour
  const { count, error } = await supabase
    .from("chat_messages")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  // If there is an error, return false
  if (error) {
    console.error(error);
    return { ok: false, reason: "check_failed" };
  }

  // If the number of chat messages in the last hour is greater than or equal to the limit, return false
  if ((count ?? 0) >= AI_LIMITS.CHAT_MESSAGES_PER_HOUR) {
    return { ok: false, reason: "over_limit" };
  }

  return { ok: true };
}
