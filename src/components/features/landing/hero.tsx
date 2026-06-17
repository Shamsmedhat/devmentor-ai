import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { TerminalAnimation } from "./terminal-animation";

export async function Hero() {
  // Translation
  const t = await getTranslations();

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-background">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-14 px-4 pb-20 pt-32 text-center lg:px-8">
        <div className="flex max-w-3xl flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {t("landing-hero-eyebrow")}
          </p>

          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:80ms] fill-mode-[both]">
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t("landing-hero-headline-ar")}
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg font-normal text-muted-foreground sm:text-xl">
              {t("landing-hero-headline-en")}
            </p>
            <p className="mx-auto max-w-prose text-pretty text-base leading-relaxed text-muted-foreground/90 sm:text-lg">
              {t("landing-hero-subheading")}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 [animation-delay:160ms] fill-mode-[both]">
            <Button
              asChild
              size="lg"
              className={cn(
                "group relative h-12 rounded-xl border border-brand/50 bg-brand/10 px-8 text-sm font-semibold text-brand shadow-[0_0_30px_color-mix(in_srgb,var(--brand)_20%,transparent)]",
                "hover:border-brand hover:bg-brand/20",
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

        <div className="relative w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-900 [animation-delay:220ms] fill-mode-[both]">
          <TerminalAnimation />
        </div>
      </div>
    </section>
  );
}
