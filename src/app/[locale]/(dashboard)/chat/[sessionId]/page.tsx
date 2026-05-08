import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { loadAuthenticatedChatSessions } from "@/lib/utils/auth/load-authenticated-chat-sessions";
import ChatShell from "@/components/features/chat/chat-shell";

type Props = {
  params: Promise<{ locale: string; sessionId: string }>;
};

export async function generateMetadata(props: Omit<Props, "children">) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: t("metadata-title"),
    description: t("metadata-description"),
  };
}

export default async function ChatSessionPage({ params }: Props) {
  // Params
  const { locale, sessionId } = await params;

  setRequestLocale(locale);

  const { user, initialSessions } = await loadAuthenticatedChatSessions({
    locale,
    callbackPath: `/${locale}/chat/${sessionId}`,
  });

  const isOwned = initialSessions.some((s) => s.id === sessionId);

  if (!isOwned) {
    redirect(`/${locale}/chat`);
  }

  return (
    <ChatShell
      user={user}
      initialSessions={initialSessions}
      initialSessionIdFromUrl={sessionId}
    />
  );
}
