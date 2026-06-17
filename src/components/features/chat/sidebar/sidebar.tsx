"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import BrandMark from "@/components/shared/brand-mark";
import { useChatSessionsRealtime } from "@/hooks/chat/use-chat-sessions-realtime";
import { Link, useRouter } from "@/i18n/navigation";
import type { ChatSession } from "@/lib/types/chat";
import { cn } from "@/lib/utils";
import { buildChatPath } from "@/lib/utils/chat/chat-navigation.util";
import { formatRelativeTime } from "@/lib/utils/date.util";
import { createClient } from "@/lib/utils/supabase/client";
import Image from "next/image";

interface ChatSidebarProps {
  user: User;
  initialSessions: ChatSession[];
}

export function ChatSidebar({ user, initialSessions }: ChatSidebarProps) {
  // Translation
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === "ar";

  // Navigation
  const router = useRouter();
  const params = useParams();
  const selectedSessionId =
    (params?.sessionId as string[] | undefined)?.[0] ?? null;

  // Sidebar (mobile sheet close)
  const { setOpenMobile } = useSidebar();

  // Variables
  const userId = user.id;
  const initials = (user.email ?? "DM").slice(0, 2).toUpperCase();
  const displayName = user.email ?? t("chat-account-fallback");

  // Hooks
  const sessions = useChatSessionsRealtime(userId, initialSessions);

  // Functions
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleSessionSelect(session: ChatSession) {
    router.push(buildChatPath(session.id));
    setOpenMobile(false);
  }

  function handleNewChat() {
    router.push(buildChatPath(null));
    setOpenMobile(false);
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-sidebar-border"
      side={isArabic ? "right" : "left"}
    >
      {/* Brand */}
      <SidebarHeader className="border-b border-sidebar-border ">
        <div>
          <Link
            href="/"
            className="inline-flex items-center"
          >
            <Image
              src="/devmentor_ai_logo_sm.png"
              alt="DevMentor AI"
              width={150}
              height={0}
            />
          </Link>
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
                  onClick={handleNewChat}
                  className={cn(
                    "h-auto min-h-8 border border-brand/20 bg-brand/8 py-2 text-brand",
                    "hover:bg-brand/15 hover:text-brand",
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
                  disabled
                  aria-disabled
                  className="h-auto min-h-8 border-sidebar-border py-2 text-sidebar-foreground/70"
                >
                  <Code2 className="shrink-0" />
                  <span>{t("chat-code-review")}</span>
                  <Badge
                    variant="secondary"
                    className="ms-auto"
                  >
                    {t("chat-soon")}
                  </Badge>
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs font-medium text-brand">
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
