"use client";

import { useEffect, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import { Code2, LogOut, MessageSquare, Plus } from "lucide-react";

import type { User } from "@supabase/supabase-js";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "@/i18n/navigation";
import type { ChatSession } from "@/lib/types/chat";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils/date.util";
import { createClient } from "@/lib/utils/supabase/client";

import { useChatUi } from "../chat-ui.context";

interface ChatSidebarProps {
  user: User;
  initialSessions: ChatSession[];
}

export function ChatSidebar({
  user,
  initialSessions,
}: ChatSidebarProps) {
  // Translation
  const t = useTranslations();
  const locale = useLocale();

  // Navigation
  const router = useRouter();

  // Hooks
  const { selectedSessionId, selectSession, startNewChat } = useChatUi();

  // Sidebar (mobile sheet close)
  const { setOpenMobile } = useSidebar();

  // State
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);

  // Variables
  const userId = user.id;
  const initials = (user.email ?? "DM").slice(0, 2).toUpperCase();
  const displayName = user.email ?? "Account";

  // Effects
  useEffect(() => {
    const supabase = createClient();

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
          void supabase
            .from("chat_sessions")
            .select("*")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error(error.message);
                return;
              }
              setSessions(data ?? []);
            });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  // Functions
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSessionSelect(session: ChatSession) {
    selectSession(session);
    setOpenMobile(false);
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-sidebar-border"
    >
      {/* Brand */}
      <SidebarHeader className="border-b border-sidebar-border px-2 py-4">
        <div className="flex items-center gap-2.5 px-2">
          <HexIcon className="h-6 w-6 text-chart-2" />
          <span className="text-sm font-semibold text-sidebar-foreground">
            DevMentor <span className="text-chart-2">AI</span>
          </span>
        </div>
      </SidebarHeader>

      {/* Actions */}
      <SidebarContent className="gap-0">
        <SidebarGroup className="pt-2">
          <SidebarGroupContent className="flex flex-col gap-2 px-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  onClick={() => {
                    startNewChat();
                    setOpenMobile(false);
                  }}
                  className={cn(
                    "h-auto min-h-8 border border-chart-2/20 bg-chart-2/8 py-2 text-chart-2",
                    "hover:bg-chart-2/15 hover:text-chart-2",
                  )}
                >
                  <Plus className="shrink-0" />
                  <span>{t("chat-new")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  variant="outline"
                  className="h-auto min-h-8 border-sidebar-border py-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                >
                  <Code2 className="shrink-0" />
                  <span>{t("chat-code-review")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* History */}
        <SidebarGroup className="min-h-0 flex-1">
          <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-widest text-sidebar-foreground/40">
            {t("chat-recent")}
          </SidebarGroupLabel>
          <SidebarGroupContent className="min-h-0 flex-1 overflow-hidden px-1">
            {sessions.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-sidebar-foreground/35">
                {t("chat-empty-history")}
              </p>
            ) : (
              <SidebarMenu className="chat-scrollbar max-h-full overflow-y-auto">
                {sessions.map((session) => {
                  const isActive = session.id === selectedSessionId;
                  return (
                    <SidebarMenuItem key={session.id}>
                      <SidebarMenuButton
                        type="button"
                        isActive={isActive}
                        onClick={() => handleSessionSelect(session)}
                        className="h-auto min-h-10 gap-2 py-2 pe-2"
                      >
                        <MessageSquare className="size-3.5 shrink-0" />
                        <span className="flex-1 truncate text-start text-xs">
                          {session.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-sidebar-foreground/35">
                          {formatRelativeTime(session.updated_at, locale)}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-medium text-cyan-400">
            {initials}
          </div>
          <span className="flex-1 truncate text-sm text-sidebar-foreground/70">
            {displayName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            title={t("chat-logout")}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/35 transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function HexIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L21.196 7V17L12 22L2.804 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L17.598 9.25V15.75L12 19L6.402 15.75V9.25L12 6Z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}
