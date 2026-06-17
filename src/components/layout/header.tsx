"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import BrandMark from "../shared/brand-mark";

export default function Header() {
  // Translation
  const t = useTranslations();

  // State
  const [scrolled, setScrolled] = useState(false);

  // Effects
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 lg:pt-4">
      <div className="mx-auto max-w-5xl">
        <div
          className={cn(
            "flex h-14 items-center justify-between rounded-full border px-4 transition-all duration-300 sm:px-6",
            scrolled
              ? "border-white/10 bg-background/70 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
        >
          {/* Brand */}
          <BrandMark
            size="sm"
            href="/"
          />

          {/* CTA */}
          <Button
            asChild
            size="sm"
            className="h-9 rounded-full border border-brand/40 bg-brand/10 px-5 text-xs font-semibold text-brand transition-colors hover:border-brand hover:bg-brand/20"
          >
            <Link href="/chat">{t("landing-hero-cta")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
