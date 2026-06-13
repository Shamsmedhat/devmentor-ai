import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

const CONTACT_EMAIL = "shamsmedhat1@gmail.com";
const SECTIONS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return { title: t("legal-privacy-title") };
}

export default async function PrivacyPage({ params }: Props) {
  // Params
  const { locale } = await params;

  setRequestLocale(locale);

  // Translation
  const t = await getTranslations();

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-16 sm:py-20">
      <Link
        href="/"
        className="text-sm font-medium text-chart-2/90 transition-colors hover:text-chart-2"
      >
        {t("legal-back-home")}
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
        {t("legal-privacy-title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("legal-privacy-updated")}
      </p>
      <p className="mt-6 text-pretty leading-relaxed text-muted-foreground">
        {t("legal-privacy-intro")}
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section
            key={section}
            className="space-y-2"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {t(`legal-privacy-${section}-title`)}
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {linkifyEmail(t(`legal-privacy-${section}-body`))}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}

// Renders the body, turning the literal contact email into a mailto link while
// leaving the surrounding (translated) copy untouched.
function linkifyEmail(text: string): ReactNode {
  const parts = text.split(CONTACT_EMAIL);
  if (parts.length === 1) return text;

  return parts.flatMap((part, index) =>
    index < parts.length - 1
      ? [
          part,
          <a
            key={index}
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-chart-2 underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>,
        ]
      : [part],
  );
}
