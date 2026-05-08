"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { User } from "@supabase/supabase-js";
import type { ChatSession } from "@/lib/types/chat";

import ChatArea from "./chat-section/chat-area";
import { ChatUiProvider } from "./chat-ui.context";
import { ChatSidebar } from "./sidebar/sidebar";

interface ChatLandingProps {
  user: User;
  initialSessions: ChatSession[];
}

export default function ChatLanding({
  user,
  initialSessions,
}: ChatLandingProps) {
  // Variables
  const sidebarSessionKey =
    initialSessions.length === 0
      ? "none"
      : initialSessions.map((session) => session.id).join(":");

  return (
    <ChatUiProvider initialSessions={initialSessions}>
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
