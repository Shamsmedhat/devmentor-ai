import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-white/5 bg-background py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground/70 sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-md border border-chart-2/40 bg-chart-2/10 font-mono text-xs font-bold text-chart-2">
            D
          </span>
          <span className="text-foreground/80">
            DevMentor <span className="text-chart-2">AI</span>
          </span>
          <span className="hidden text-muted-foreground/50 sm:inline">-</span>
          <span className="hidden sm:inline">{t("footer-tagline")}</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="transition hover:text-foreground"
          >
            {t("footer-privacy")}
          </Link>
          <Link
            href="/terms"
            className="transition hover:text-foreground"
          >
            {t("footer-terms")}
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            {t("footer-github")}
          </a>
        </nav>

        <p className="text-xs text-muted-foreground/60">
          {t("footer-credits")}
        </p>
      </div>
    </footer>
  );
}
