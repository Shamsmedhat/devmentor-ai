import { getTranslations, setRequestLocale } from "next-intl/server";

import { loadAuthenticatedChatSessions } from "@/lib/utils/auth/load-authenticated-chat-sessions";
import ChatLanding from "@/components/features/chat/chat-landing";

// Types
type Props = {
  params: Promise<{ locale: string }>;
};

// Metadata
export async function generateMetadata(props: Props) {
  // Translations
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: t("metadata-title"),
    description: t("metadata-description"),
  };
}

export default async function ChatPage({ params }: Props) {
  // Params
  const { locale } = await params;

  setRequestLocale(locale);

  const { user, initialSessions } = await loadAuthenticatedChatSessions({
    locale,
    callbackPath: `/${locale}/chat`,
  });

  return (
    <ChatLanding
      user={user}
      initialSessions={initialSessions}
    />
  );
}
