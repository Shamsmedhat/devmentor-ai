"use client";

import { useEffect, useState } from "react";

import type { ChatSession } from "@/lib/types/chat";
import { createClient } from "@/lib/utils/supabase/client";

export function useChatSessionsRealtime(
  userId: string,
  initialSessions: ChatSession[],
): ChatSession[] {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);

  // Effects
  useEffect(() => {
    const supabase = createClient();

    // Refetch the full list whenever any change lands on the user's sessions.
    // Simple over diff-patching - fine until the list grows large.
    async function refetchSessions() {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error(error.message);
        return;
      }

      setSessions(data ?? []);
    }

    const channel = supabase
      .channel(`chat_sessions_changes:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refetchSessions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return sessions;
}
