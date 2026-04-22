"use client";

import { useTranslations } from "next-intl";
import { Code2, LogOut, MessageSquare, Plus } from "lucide-react";

import type { User } from "@supabase/supabase-js";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

const MOCK_SESSIONS = [
  { id: "s1", title: "راجعلي component الـ Auth", time: "منذ ساعة" },
  { id: "s2", title: "مشكلة في useEffect dependencies", time: "أمس" },
  { id: "s3", title: "إزاي أعمل Server Action في Next.js", time: "منذ 3 أيام" },
];

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  // Translation
  const t = useTranslations();

  // Navigation
  const router = useRouter();

  // Variables
  const initials = (user?.email ?? "DM").slice(0, 2).toUpperCase();
  const displayName = user?.email ?? "Guest";

  // Functions
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 inset-s-0 z-50 flex w-[260px] shrink-0 flex-col",
        "border-e border-white/6 bg-primary-surface",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full",
        "lg:relative lg:translate-x-0",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <HexIcon className="h-6 w-6 text-secondary" />
        <span className="text-sm font-semibold text-white">
          DevMentor <span className="text-secondary">AI</span>
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 px-3 pb-3">
        <button
          onClick={onClose}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
            "border border-secondary/20 bg-secondary/8 text-secondary",
            "transition-colors hover:bg-secondary/15",
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {t("chat-new")}
        </button>

        <button
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
            "border border-white/8 text-white/60",
            "transition-colors hover:border-white/20 hover:text-white",
          )}
        >
          <Code2 className="h-4 w-4 shrink-0" />
          {t("chat-code-review")}
        </button>
      </div>

      {/* Chat history */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-white/25">
          {t("chat-recent")}
        </p>

        <div className="chat-scrollbar flex-1 overflow-y-auto px-2">
          {MOCK_SESSIONS.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-white/25">
              {t("chat-empty-history")}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {MOCK_SESSIONS.map((session, index) => (
                <li key={session.id}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start",
                      "transition-colors duration-150",
                      index === 0
                        ? "border-s-2 border-cyan-400 bg-white/6 text-white"
                        : "text-white/50 hover:bg-white/4 hover:text-white",
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate text-xs">{session.title}</span>
                    <span className="shrink-0 text-[11px] text-white/25">
                      {session.time}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-medium text-cyan-400">
            {initials}
          </div>
          <span className="flex-1 truncate text-sm text-white/60">{displayName}</span>
          <button
            onClick={handleSignOut}
            title={t("chat-logout")}
            className="shrink-0 text-white/25 transition-colors hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
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
