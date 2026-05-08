"use client";

import { useLocale, useTranslations } from "next-intl";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useChatSessionMessages } from "@/hooks/chat/use-chat-session-messages";
import { cn } from "@/lib/utils";

import ChatSessionPanel from "./chat-session-panel";

export type SelectedSessionChangeOptions = { skipNavigation?: boolean };

interface ChatAreaProps {
  selectedSessionId: string | null;
  onSelectedSessionIdChange: (
    id: string | null,
    options?: SelectedSessionChangeOptions,
  ) => void;
  onSyncChatSessionUrl: (sessionId: string) => void;
  currentTitle: string;
  onTitleChange: (title: string) => void;
}

export default function ChatArea({
  selectedSessionId,
  onSelectedSessionIdChange,
  onSyncChatSessionUrl,
  currentTitle,
  onTitleChange,
}: ChatAreaProps) {
  // Translation
  const t = useTranslations();
  const locale = useLocale();

  // Navigation
  const router = useRouter();
  const pathname = usePathname();

  // Hooks
  const {
    loadedMessages,
    panelKey,
    isLoadingSessionMessages,
    errorMessage,
    setErrorMessage,
    markSyncingFromCreate,
  } = useChatSessionMessages(selectedSessionId);

  // Functions
  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <SidebarTrigger className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground/80">
            {currentTitle}
          </span>
        </div>

        {/* Locale switch */}
        <div className="flex items-center rounded-full border border-white/6 bg-white/4 p-0.5">
          {(["ar", "en"] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => switchLocale(loc)}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition-all",
                locale === loc
                  ? "bg-white/8 text-white"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              {loc === "ar" ? "AR" : "EN"}
            </button>
          ))}
        </div>
      </header>

      {errorMessage && (
        <div className="mx-4 mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      <ChatSessionPanel
        key={panelKey}
        initialMessages={loadedMessages}
        isLoadingSessionMessages={isLoadingSessionMessages}
        selectedSessionId={selectedSessionId}
        onSelectedSessionIdChange={(id, options) => {
          if (options?.skipNavigation) {
            markSyncingFromCreate();
          }
          onSelectedSessionIdChange(id, options);
        }}
        onSyncChatSessionUrl={onSyncChatSessionUrl}
        errorMessage={t("chat-error")}
        attachmentErrorKeys={{
          too_many: t("chat-attachment-error-too-many"),
          too_large: t("chat-attachment-error-too-large"),
          type_not_allowed: t("chat-attachment-error-type"),
        }}
        onTitleChange={onTitleChange}
        onBannerError={setErrorMessage}
      />
    </div>
  );
}
