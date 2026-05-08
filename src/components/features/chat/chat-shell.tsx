"use client";

import { useState } from "react";

import type { User } from "@supabase/supabase-js";

import type { ChatSession } from "@/lib/types/chat";
import { usePathname, useRouter } from "@/i18n/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import ChatArea from "./chat-section/chat-area";
import { ChatSidebar } from "./sidebar/sidebar";

const DEFAULT_CHAT_TITLE = "DevMentor AI";

// Types
interface ChatShellProps {
  user: User;
  initialSessions: ChatSession[];
  initialSessionIdFromUrl: string | null;
}

// Helper functions
function matchUrlSessionIdToSessions(
  sessions: ChatSession[],
  urlSessionId: string | null,
): { sessionId: string | null; title: string } {
  if (!urlSessionId) {
    return { sessionId: null, title: DEFAULT_CHAT_TITLE };
  }

  // Find the session that matches the urlSessionId
  const match = sessions.find((s) => s.id === urlSessionId);
  if (!match) {
    return { sessionId: null, title: DEFAULT_CHAT_TITLE };
  }

  return { sessionId: match.id, title: match.title };
}

export default function ChatShell({
  user,
  initialSessions,
  initialSessionIdFromUrl,
}: ChatShellProps) {
  // Navigation
  const router = useRouter();
  const pathname = usePathname();

  // Variables
  const { sessionId: urlSessionId, title: urlSessionTitle } =
    matchUrlSessionIdToSessions(initialSessions, initialSessionIdFromUrl);

  // State
  const [currentTitle, setCurrentTitle] = useState(urlSessionTitle);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    urlSessionId,
  );

  // Functions
  function navigateToChatPath(sessionId: string | null): void {
    if (sessionId) {
      router.replace(`/chat/${sessionId}`);
      return;
    }

    router.replace("/chat");
  }

  function handleSessionSelect(session: ChatSession) {
    setSelectedSessionId(session.id);
    setCurrentTitle(session.title);
    navigateToChatPath(session.id);
  }

  function handleNewChat() {
    setSelectedSessionId(null);
    setCurrentTitle(DEFAULT_CHAT_TITLE);
    navigateToChatPath(null);
  }

  function handleSelectedSessionIdChange(
    id: string | null,
    options?: { skipNavigation?: boolean },
  ): void {
    setSelectedSessionId(id);
    if (!options?.skipNavigation) {
      navigateToChatPath(id);
    }
  }

  // programmatic navigation
  function syncChatSessionUrl(sessionId: string): void {
    const suffix = `/chat/${sessionId}`;
    const normalized = pathname.replace(/\/$/, "") || pathname;
    if (normalized === suffix || normalized.endsWith(suffix)) {
      return;
    }
    navigateToChatPath(sessionId);
  }

  // Variables
  const sidebarSessionKey =
    initialSessions.length === 0
      ? "none"
      : initialSessions.map((s) => s.id).join(":");

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <ChatSidebar
        key={`${user.id}:${sidebarSessionKey}`}
        user={user}
        initialSessions={initialSessions}
        activeSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />

      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <ChatArea
          selectedSessionId={selectedSessionId}
          onSelectedSessionIdChange={handleSelectedSessionIdChange}
          onSyncChatSessionUrl={syncChatSessionUrl}
          currentTitle={currentTitle}
          onTitleChange={setCurrentTitle}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
