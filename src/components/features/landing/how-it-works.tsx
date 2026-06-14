import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { SectionHeading } from "./section-heading";

function LayersIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z" />
      <path d="M4 19a2 2 0 0 1 2-2h12" />
      <path d="M8 7h6M8 11h6" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 8-5 4 5 4" />
      <path d="m15 8 5 4-5 4" />
      <path d="m13 6-2 12" />
    </svg>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}

function StepCard({ number, title, description, icon }: StepCardProps) {
  return (
    <article className="group relative flex-1 overflow-hidden rounded-2xl border border-white/8 bg-card/70 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_0_40px_color-mix(in_srgb,var(--brand)_6%,transparent)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-4 inset-e-4 select-none text-8xl font-bold leading-none text-white/4"
      >
        {number}
      </span>

      <div className="relative flex size-12 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand shadow-[0_0_24px_color-mix(in_srgb,var(--brand)_15%,transparent)]">
        {icon}
      </div>

      <h3 className="relative mt-6 text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        {description}
      </p>
    </article>
  );
}

function Connector() {
  return (
    <div
      aria-hidden
      className="relative hidden h-px flex-1 self-center lg:block"
    >
      <div className="absolute inset-0 border-t border-dashed border-white/10" />
      <span
        className="absolute inset-s-1/2 top-1/2 block size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_16px_color-mix(in_srgb,var(--brand)_80%,transparent)]"
        style={{ animation: "glow-pulse 2.4s ease-in-out infinite" }}
      />
    </div>
  );
}

export async function HowItWorks() {
  const t = await getTranslations();

  return (
    <section
      id="how-it-works"
      className="relative bg-background py-24 sm:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading title={t("how-title")} subtitle={t("how-subtitle")} />

        <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-6 lg:mt-20 lg:flex-row lg:items-stretch lg:gap-4">
          <StepCard
            number="01"
            title={t("how-step-1-title")}
            description={t("how-step-1-desc")}
            icon={<LayersIcon />}
          />
          <Connector />
          <StepCard
            number="02"
            title={t("how-step-2-title")}
            description={t("how-step-2-desc")}
            icon={<BookIcon />}
          />
          <Connector />
          <StepCard
            number="03"
            title={t("how-step-3-title")}
            description={t("how-step-3-desc")}
            icon={<CodeIcon />}
          />
        </div>
      </div>
    </section>
  );
}
