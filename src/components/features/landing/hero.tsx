import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TerminalAnimation } from "./terminal-animation";

export async function Hero() {
  // Translation
  const t = await getTranslations();

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-primary">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-14 px-4 pb-20 pt-24 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-xl flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary/80 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {t("landing-hero-eyebrow")}
          </p>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:80ms] fill-mode-[both]">
            <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-primary-text sm:text-4xl lg:text-4xl lg:leading-tight">
              <span className="block text-primary-text">
                {t("landing-hero-headline-ar")}
              </span>
              <span className="mt-2 block text-lg font-normal text-primary-muted sm:text-xl">
                {t("landing-hero-headline-en")}
              </span>
            </h1>
            <p className="max-w-prose text-pretty text-base leading-relaxed text-primary-muted sm:text-lg">
              {t("landing-hero-subheading")}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:160ms] fill-mode-[both]">
            <Button
              asChild
              size="lg"
              variant="outline"
              className={cn(
                "group relative h-11 rounded-xl border border-white/20 bg-primary-surface px-7 text-sm font-semibold text-white",
                "hover:border-white/35 hover:bg-white/8",
                "transition-colors duration-300",
              )}
            >
              <Link
                href="/chat"
                aria-label={t("landing-hero-cta-aria")}
              >
                <span className="relative z-10">{t("landing-hero-cta")}</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative flex flex-1 justify-center animate-in fade-in slide-in-from-bottom-4 duration-900 [animation-delay:220ms] fill-mode-[both] lg:justify-end">
          <TerminalAnimation />
        </div>
      </div>
    </section>
  );
}
