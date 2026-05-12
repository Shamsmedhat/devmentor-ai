import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import ChatShell from "@/components/features/chat/chat-shell";
import { loadAuthenticatedChatSessions } from "@/lib/utils/auth/load-authenticated-chat-sessions";
import { getChatMessages } from "@/lib/services/chat.service";
import { Suspense } from "react";
import { ChatMessagesSkeleton } from "@/components/skeletons/chat-messages-skeleton";

type Props = {
  params: Promise<{ locale: string; sessionId?: string[] }>;
};

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: t("metadata-title"),
    description: t("metadata-description"),
  };
}

export default async function ChatPage({ params }: Props) {
  // Params
  const { locale, sessionId: sessionIdSegments } = await params;

  setRequestLocale(locale);

  const sessionId = sessionIdSegments?.[0] ?? null;
  const callbackPath = sessionId
    ? `/${locale}/chat/${sessionId}`
    : `/${locale}/chat`;

  const { user, initialSessions } = await loadAuthenticatedChatSessions({
    locale,
    callbackPath,
  });

  // Ownership check: redirect to /chat if the session id isn't ours.
  if (sessionId && !initialSessions.some((s) => s.id === sessionId)) {
    redirect(`/${locale}/chat`);
  }
  // Catch-all only handles /chat and /chat/<id>; reject deeper paths.
  if (sessionIdSegments && sessionIdSegments.length > 1) {
    redirect(`/${locale}/chat`);
  }

  // Initial title shown in the header before the user types anything.
  const initialTitle = sessionId
    ? initialSessions.find((s) => s.id === sessionId)?.title
    : undefined;

  const initialMessages = sessionId ? await getChatMessages(sessionId) : [];

  return (
    <Suspense fallback={<ChatMessagesSkeleton />}>
      <ChatShell
        user={user}
        initialSessions={initialSessions}
        initialTitle={initialTitle}
        sessionId={sessionId}
        initialMessages={initialMessages}
      />
    </Suspense>
  );
}
