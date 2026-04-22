import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-white/5 bg-primary py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 text-sm text-primary-muted/70 sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-md border border-secondary/40 bg-secondary/10 font-mono text-xs font-bold text-secondary">
            D
          </span>
          <span className="text-primary-text/80">
            DevMentor <span className="text-secondary">AI</span>
          </span>
          <span className="hidden text-primary-muted/50 sm:inline">—</span>
          <span className="hidden sm:inline">{t("footer-tagline")}</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="transition hover:text-primary-text"
          >
            {t("footer-privacy")}
          </Link>
          <Link href="/terms" className="transition hover:text-primary-text">
            {t("footer-terms")}
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-primary-text"
          >
            {t("footer-github")}
          </a>
        </nav>

        <p className="text-xs text-primary-muted/60">{t("footer-credits")}</p>
      </div>
    </footer>
  );
}
