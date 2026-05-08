import { getTranslations } from "next-intl/server";

import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const CHATGPT_KEYS = [
  "problem-chatgpt-1",
  "problem-chatgpt-2",
  "problem-chatgpt-3",
  "problem-chatgpt-4",
  "problem-chatgpt-5",
] as const;

const DEVMENTOR_KEYS = [
  "problem-devmentor-1",
  "problem-devmentor-2",
  "problem-devmentor-3",
  "problem-devmentor-4",
  "problem-devmentor-5",
] as const;

function XIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="mt-1 size-4 shrink-0 text-muted-foreground/60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="mt-1 size-4 shrink-0 text-chart-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export async function ProblemStatement() {
  const t = await getTranslations();

  return (
    <section
      id="problem"
      className="relative isolate overflow-hidden bg-background py-24 sm:py-32 lg:py-40"
    >
      <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-60" />

      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading
          title={t("problem-title")}
          subtitle={t("problem-subtitle")}
        />

        <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:mt-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <div
            className={cn(
              "group rounded-2xl border border-white/5 bg-card/70 p-8 opacity-70 backdrop-blur-sm transition",
              "hover:opacity-90 hover:border-white/10",
            )}
          >
            <header className="flex items-center gap-3 border-b border-white/5 pb-5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <rect x="3" y="6" width="18" height="13" rx="3" />
                  <circle cx="9" cy="12" r="1.2" fill="currentColor" />
                  <circle cx="15" cy="12" r="1.2" fill="currentColor" />
                  <path d="M12 3v3" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground/80">
                {t("problem-chatgpt-title")}
              </h3>
            </header>

            <ul className="mt-6 space-y-4 text-sm text-muted-foreground sm:text-[15px]">
              {CHATGPT_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <XIcon />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden
            className="relative hidden items-center justify-center lg:flex"
          >
            <div className="absolute inset-y-0 inset-s-1/2 w-px -translate-x-1/2 bg-linear-to-b from-transparent via-white/10 to-transparent" />
            <span className="relative z-10 rounded-full border border-white/10 bg-card px-3 py-1.5 text-xs font-semibold tracking-widest text-muted-foreground/70">
              {t("problem-vs")}
            </span>
          </div>

          <div
            className={cn(
              "group relative rounded-2xl border border-chart-2/20 bg-linear-to-b from-chart-2/6 to-transparent p-8 backdrop-blur-sm transition",
              "hover:border-chart-2/35",
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08), transparent 60%)",
              }}
            />

            <header className="flex items-center gap-3 border-b border-white/5 pb-5">
              <div className="flex size-9 items-center justify-center rounded-lg border border-chart-2/30 bg-chart-2/10 text-chart-2 shadow-[0_0_24px_rgba(0,212,255,0.25)]">
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 4 7v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V7l-8-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("problem-devmentor-title")}
              </h3>
            </header>

            <ul className="mt-6 space-y-4 text-sm text-foreground/90 sm:text-[15px]">
              {DEVMENTOR_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <CheckIcon />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
