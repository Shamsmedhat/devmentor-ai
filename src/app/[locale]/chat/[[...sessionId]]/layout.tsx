import type { ReactNode } from "react";

import { setRequestLocale } from "next-intl/server";

import { AuthToaster } from "@/components/features/auth/auth-toaster";
import ChatHeader from "@/components/features/chat/chat-section/chat-header";
import { ChatSidebar } from "@/components/features/chat/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatUiProvider } from "@/lib/context/chat-ui.context";
import { loadAuthenticatedChatSessions } from "@/lib/utils/auth/load-authenticated-chat-sessions";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string; sessionId?: string[] }>;
};

export default async function ChatLayout({ children, params }: Props) {
  // Params
  const { locale, sessionId: sessionIdSegments } = await params;

  setRequestLocale(locale);

  // Auth + sessions (seeds the persistent sidebar; realtime keeps it fresh)
  const sessionId = sessionIdSegments?.[0] ?? null;
  const callbackPath = sessionId
    ? `/${locale}/chat/${sessionId}`
    : `/${locale}/chat`;

  const { user, initialSessions } = await loadAuthenticatedChatSessions({
    locale,
    callbackPath,
  });

  return (
    <ChatUiProvider>
      <SidebarProvider className="h-svh overflow-hidden">
        <ChatSidebar
          user={user}
          initialSessions={initialSessions}
        />

        <SidebarInset className="min-h-0 min-w-0 overflow-hidden chat-scrollbar">
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Chat header */}
            <ChatHeader />

            {/* Per-session content slot */}
            {children}
          </div>
        </SidebarInset>

        <AuthToaster />
      </SidebarProvider>
    </ChatUiProvider>
  );
}
