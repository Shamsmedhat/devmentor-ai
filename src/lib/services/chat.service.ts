import type { ChatSession, ChatUIMessage } from "@/lib/types/chat";
import { createClient } from "@/lib/utils/supabase/server";

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ChatSession[];
}

export async function getChatSession(
  sessionId: string,
  userId: string,
): Promise<ChatSession | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ChatSession | null) ?? null;
}

export async function getChatMessages(
  sessionId: string,
): Promise<ChatUIMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ChatUIMessage[];
}
