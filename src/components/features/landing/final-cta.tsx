import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function FinalCTA() {
  const t = await getTranslations();

  return (
    <section className="relative isolate overflow-hidden bg-primary py-28 sm:py-36 lg:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.09) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="dot-grid absolute inset-0 -z-10 opacity-50"
      />

      <div className="container mx-auto px-4 text-center lg:px-8">
        <h2 className="text-balance text-5xl font-semibold tracking-tight text-primary-text sm:text-6xl lg:text-7xl">
          {t("cta-title")}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-primary-muted sm:text-lg">
          {t("cta-subtitle")}
        </p>

        <div className="mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            className="animate-glow-pulse h-12 rounded-xl border border-secondary/60 bg-secondary/15 px-8 text-sm font-semibold text-secondary hover:border-secondary hover:bg-secondary/25"
          >
            <Link href="/chat">{t("cta-button")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
