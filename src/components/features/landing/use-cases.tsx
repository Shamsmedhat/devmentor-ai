import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { SectionHeading } from "./section-heading";

interface UseCaseCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

function UseCaseCard({ title, description, icon }: UseCaseCardProps) {
  return (
    <article className="group relative flex flex-col gap-5 rounded-2xl border border-white/8 bg-primary-surface/70 p-8 transition hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_0_40px_rgba(0,212,255,0.05)]">
      <div className="flex size-12 items-center justify-center rounded-xl border border-secondary/25 bg-secondary/8 text-secondary shadow-[0_0_24px_rgba(0,212,255,0.12)]">
        {icon}
      </div>
      <div className="space-y-2.5">
        <h3 className="text-xl font-semibold text-primary-text">{title}</h3>
        <p className="text-sm leading-relaxed text-primary-muted sm:text-[15px]">
          {description}
        </p>
      </div>
    </article>
  );
}

function SeedlingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21v-7" />
      <path d="M12 14c0-4 3-7 7-7-1 4-3 7-7 7Z" />
      <path d="M12 14c0-3-2-6-6-6 1 3 3 6 6 6Z" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M21 19c0-2.4-1.8-4.3-4-4.3" />
    </svg>
  );
}

export async function UseCases() {
  const t = await getTranslations();

  return (
    <section
      id="use-cases"
      className="relative bg-primary py-24 sm:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading
          title={t("usecases-title")}
          subtitle={t("usecases-subtitle")}
        />

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3 lg:mt-20">
          <UseCaseCard
            title={t("usecases-1-title")}
            description={t("usecases-1-desc")}
            icon={<SeedlingIcon />}
          />
          <UseCaseCard
            title={t("usecases-2-title")}
            description={t("usecases-2-desc")}
            icon={<TerminalIcon />}
          />
          <UseCaseCard
            title={t("usecases-3-title")}
            description={t("usecases-3-desc")}
            icon={<UsersIcon />}
          />
        </div>
      </div>
    </section>
  );
}
