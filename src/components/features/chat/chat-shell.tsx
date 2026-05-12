"use client";

import type { User } from "@supabase/supabase-js";

import { AuthToaster } from "@/components/features/auth/auth-toaster";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ChatSession, ChatUIMessage } from "@/lib/types/chat";

import ChatArea from "./chat-section/chat-area";
import { ChatUiProvider } from "../../../lib/context/chat-ui.context";
import { ChatSidebar } from "./sidebar/sidebar";

interface ChatShellProps {
  user: User;
  initialSessions: ChatSession[];
  initialTitle?: string;
  sessionId: string | null;
  initialMessages: ChatUIMessage[];
}

export default function ChatShell({
  user,
  initialSessions,
  initialTitle,
  sessionId,
  initialMessages,
}: ChatShellProps) {
  return (
    <ChatUiProvider initialTitle={initialTitle}>
      <SidebarProvider className="h-svh overflow-hidden">
        <ChatSidebar
          user={user}
          initialSessions={initialSessions}
        />

        <SidebarInset className="min-h-0 min-w-0 overflow-hidden chat-scrollbar">
          <ChatArea
            sessionId={sessionId}
            initialMessages={initialMessages}
          />
        </SidebarInset>
        <AuthToaster />
      </SidebarProvider>
    </ChatUiProvider>
  );
}
