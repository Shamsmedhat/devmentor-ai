"use server";

import type { ChatMessageMetadata, ChatUIMessage } from "@/lib/types/chat";
import { getChatMessages } from "@/lib/services/chat.service";
import { requireServerAuthUser } from "@/lib/utils/auth/auth-server-guard";

export async function getChatMessagesAction(
  sessionId: string,
): Promise<ChatUIMessage[]> {
  const { supabase, user } = await requireServerAuthUser();

  const { data: session, error: sessionError } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (sessionError) throw new Error(sessionError.message);
  if (!session) throw new Error("Session not found");

  return getChatMessages(sessionId);
}

export async function createChatSessionAction(title: string): Promise<string> {
  const { supabase, user } = await requireServerAuthUser();

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Failed to create session");
  return data.id as string;
}

export async function saveChatMessageAction(fields: {
  sessionId: string;
  role: "user" | "assistant";
  parts: ChatUIMessage["parts"];
  metadata?: ChatMessageMetadata;
}): Promise<void> {
  const { supabase, user } = await requireServerAuthUser();

  const { error } = await supabase.from("chat_messages").insert({
    session_id: fields.sessionId,
    user_id: user.id,
    role: fields.role,
    parts: fields.parts,
    metadata: fields.metadata ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function updateSessionTitleAction(
  sessionId: string,
  title: string,
): Promise<void> {
  const { supabase, user } = await requireServerAuthUser();

  const { error } = await supabase
    .from("chat_sessions")
    .update({ title })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
