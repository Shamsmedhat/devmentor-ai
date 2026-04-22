import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { createClient } from "@/utils/supabase/server";

import { ChatShell } from "./_components/chat-shell";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "DevMentor AI — Chat",
  description: "تحدث مع مرشدك الذكي للـ Frontend",
};

export default async function ChatPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  // Attempt to load the authenticated user — null means guest/unauthenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ChatShell user={user} />;
}
