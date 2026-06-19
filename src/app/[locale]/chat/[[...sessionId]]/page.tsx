import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import ChatInstance from "@/components/features/chat/chat-section/chat-instance";
import ChatTitleSync from "@/components/features/chat/chat-section/chat-title-sync";
import { getChatMessages, getChatSession } from "@/lib/services/chat.service";
import type { ChatUIMessage } from "@/lib/types/chat";
import { getServerSupabaseAuth } from "@/lib/utils/auth/auth-server-guard";

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

  // Catch-all only handles /chat and /chat/<id>; reject deeper paths.
  if (sessionIdSegments && sessionIdSegments.length > 1) {
    redirect(`/${locale}/chat`);
  }

  // Auth (the layout guards too; we need the id for the ownership check).
  const { user } = await getServerSupabaseAuth();

  if (!user) {
    redirect(`/${locale}/login?callbackUrl=${encodeURIComponent(`/${locale}/chat`)}`);
  }

  // Ownership: redirect to /chat if the session isn't ours.
  let initialTitle = "";
  let initialMessages: ChatUIMessage[] = [];

  if (sessionId) {
    const session = await getChatSession(sessionId, user.id);

    if (!session) {
      redirect(`/${locale}/chat`);
    }

    initialTitle = session.title;
    initialMessages = await getChatMessages(sessionId);
  }

  return (
    <>
      <ChatTitleSync title={initialTitle} />
      <ChatInstance
        sessionId={sessionId}
        initialMessages={initialMessages}
      />
    </>
  );
}
