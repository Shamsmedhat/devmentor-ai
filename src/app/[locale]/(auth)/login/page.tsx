import { setRequestLocale } from "next-intl/server";
import { safeNextPath } from "@/lib/utils/auth/safe-next-path";
import { LoginPanel } from "./_components/login-panel";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  // Navigation
  const { locale } = await params;
  const sp = await searchParams;

  // Locale
  setRequestLocale(locale);

  // Variables
  // callbackUrl
  const callbackUrlRaw =
    typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;

  // Oauth Next Path
  const oauthCallbackUrlPath = safeNextPath(callbackUrlRaw, locale);
  const showAuthError = sp.error === "auth_failed";

  return (
    <LoginPanel
      oauthCallbackUrlPath={oauthCallbackUrlPath}
      showAuthError={showAuthError}
    />
  );
}
