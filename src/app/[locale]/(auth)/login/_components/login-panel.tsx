import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { GoogleLoginButton } from "@/components/features/auth/google-login-button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LoginPanelProps = {
  oauthCallbackUrlPath: string;
  showAuthError: boolean;
};

export async function LoginPanel({
  oauthCallbackUrlPath,
  showAuthError,
}: LoginPanelProps) {
  // Translations
  const t = await getTranslations();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-card/70 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
          "backdrop-blur-md",
        )}
      >
        {/* card */}
        <div className="flex flex-col items-center gap-8">
          {/* Logo + title + subtitle */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Image
              src="/brain.svg"
              alt=""
              width={52}
              height={52}
              priority
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {t("login-title")}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-white/55">
                {t("login-subtitle")}
              </p>
            </div>
          </div>

          {/* Auth Error */}
          {showAuthError ? (
            <p
              className="w-full rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200/90"
              role="alert"
            >
              {t("login-auth-error")}
            </p>
          ) : null}

          {/* Google Login Button */}
          <div className="flex w-full flex-col items-stretch gap-4">
            <GoogleLoginButton callbackUrlPath={oauthCallbackUrlPath} />
            <p className="text-center text-xs leading-relaxed text-white/35">
              {t("login-terms")}
            </p>
          </div>

          {/* Link back to home */}
          <Link
            href="/"
            className="text-sm font-medium text-chart-2/90 transition-colors hover:text-chart-2"
          >
            {t("login-back-home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
