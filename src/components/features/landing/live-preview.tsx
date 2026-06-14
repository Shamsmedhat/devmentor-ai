import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { SectionHeading } from "./section-heading";

export async function LivePreview() {
  const t = await getTranslations();

  return (
    <section
      id="preview"
      className="relative bg-background py-24 sm:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading
          title={t("preview-title")}
          subtitle={t("preview-subtitle")}
        />

        <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 -z-10 rounded-[32px] blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand) 8%, transparent), transparent 60%)",
            }}
          />

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-card/80 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-[#FF5F57]/80" />
                <span className="size-2.5 rounded-full bg-[#FEBC2E]/80" />
                <span className="size-2.5 rounded-full bg-[#28C840]/80" />
              </div>
              <div className="mx-auto w-full max-w-sm truncate rounded-md border border-white/8 bg-muted px-3 py-1 text-center font-mono text-[11px] text-muted-foreground/80">
                {t("preview-browser-url")}
              </div>
            </div>

            {/* Chat mock */}
            <div className="relative flex min-h-[360px] flex-col gap-4 p-6 sm:min-h-[420px] sm:p-10">
              <div className="ms-auto max-w-[75%] rounded-2xl rounded-se-sm border border-white/10 bg-white/4 px-4 py-3 text-sm text-foreground/90 sm:text-[15px]">
                {t("preview-chat-user")}
              </div>

              <div className="me-auto max-w-[85%] rounded-2xl rounded-ss-sm border border-brand/25 bg-brand/5 px-4 py-3 text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
                {t("preview-chat-ai")}
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-card to-transparent"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl border border-brand/50 bg-brand/10 px-8 text-sm font-semibold text-brand shadow-[0_0_30px_color-mix(in_srgb,var(--brand)_20%,transparent)] hover:border-brand hover:bg-brand/20"
            >
              <Link href="/chat">{t("preview-cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
