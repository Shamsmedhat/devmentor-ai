"use client";

import type { User } from "@supabase/supabase-js";

import type { ChatSession } from "@/lib/types/chat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import ChatArea from "./chat-section/chat-area";
import { ChatUiProvider } from "./chat-ui.context";
import { ChatSidebar } from "./sidebar/sidebar";

interface ChatSessionProps {
  user: User;
  initialSessions: ChatSession[];
  initialSessionId: string;
}

export default function ChatSession({
  user,
  initialSessions,
  initialSessionId,
}: ChatSessionProps) {
  // Variables
  const sidebarSessionKey =
    initialSessions.length === 0
      ? "none"
      : initialSessions.map((session) => session.id).join(":");

  return (
    <ChatUiProvider
      initialSessions={initialSessions}
      initialSessionId={initialSessionId}
    >
      <SidebarProvider className="h-svh overflow-hidden">
        <ChatSidebar
          key={`${user.id}:${sidebarSessionKey}`}
          user={user}
          initialSessions={initialSessions}
        />

        <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
          <ChatArea />
        </SidebarInset>
      </SidebarProvider>
    </ChatUiProvider>
  );
}
