import { getTranslations } from "next-intl/server";

import BrandMark from "@/components/shared/brand-mark";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-white/5 bg-background py-12">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground/70 sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <BrandMark size="sm" />
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
            href="https://github.com/Shamsmedhat/devmentor-ai"
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
