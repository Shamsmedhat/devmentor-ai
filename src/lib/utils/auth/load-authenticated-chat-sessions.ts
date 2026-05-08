import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import type { ChatSession } from "@/lib/types/chat";
import { getChatSessions } from "@/lib/services/chat.service";

import { getServerSupabaseAuth } from "./auth-server-guard";

/**
 * For server chat routes: ensures a signed-in user (redirects to login otherwise),
 * then loads their chat sessions with a safe empty fallback on fetch errors.
 */
export async function loadAuthenticatedChatSessions(options: {
  locale: string;
  /** Full internal path for `callbackUrl`, e.g. `/en/chat` or `/en/chat/{id}`. */
  callbackPath: string;
}): Promise<{ user: User; initialSessions: ChatSession[] }> {
  const { locale, callbackPath } = options;

  const { user } = await getServerSupabaseAuth();

  if (!user) {
    redirect(
      `/${locale}/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
    );
  }

  let initialSessions: ChatSession[] = [];
  try {
    initialSessions = await getChatSessions(user.id);
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "getChatSessions failed",
    );
  }

  return { user, initialSessions };
}
