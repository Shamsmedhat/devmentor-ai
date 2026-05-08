"use client";

import { useTranslations } from "next-intl";

import { useChatUi } from "@/components/features/chat/chat-ui.context";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useChatSessionMessages } from "@/hooks/chat/use-chat-session-messages";
import { syncChatSessionUrl } from "@/lib/utils/chat/chat-navigation.util";

import ChatSessionPanel from "./chat-session-panel";
import ChatHeader from "./chat-header";

export default function ChatArea() {
  // Translation
  const t = useTranslations();

  // Navigation
  const router = useRouter();
  const pathname = usePathname();

  // Hooks
  const { selectedSessionId, setCurrentTitle, handleSelectedSessionIdChange } =
    useChatUi();

  const {
    loadedMessages,
    panelKey,
    isLoadingSessionMessages,
    errorMessage,
    setErrorMessage,
    markSyncingFromCreate,
  } = useChatSessionMessages(selectedSessionId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Chat header */}
      <ChatHeader />

      {/* Error */}
      {errorMessage && (
        <div className="mx-4 mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Chat session */}
      <ChatSessionPanel
        key={panelKey}
        initialMessages={loadedMessages}
        isLoadingSessionMessages={isLoadingSessionMessages}
        selectedSessionId={selectedSessionId}
        onSelectedSessionIdChange={(id, options) => {
          if (options?.skipNavigation) {
            markSyncingFromCreate();
          }
          handleSelectedSessionIdChange(id, options);
        }}
        onSyncChatSessionUrl={(sessionId) => {
          syncChatSessionUrl({ sessionId, pathname, router });
        }}
        errorMessage={t("chat-error")}
        attachmentErrorKeys={{
          too_many: t("chat-attachment-error-too-many"),
          too_large: t("chat-attachment-error-too-large"),
          type_not_allowed: t("chat-attachment-error-type"),
        }}
        onTitleChange={setCurrentTitle}
        onBannerError={setErrorMessage}
      />
    </div>
  );
}
