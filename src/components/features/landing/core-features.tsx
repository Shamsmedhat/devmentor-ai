import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

interface FeatureCardProps {
  title: string;
  description: string;
  featured?: boolean;
  visual: ReactNode;
  className?: string;
}

function FeatureCard({
  title,
  description,
  featured,
  visual,
  className,
}: FeatureCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-6 overflow-hidden rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-[0_0_40px_color-mix(in_srgb,var(--brand)_6%,transparent)]",
        featured
          ? "border-brand/25 bg-linear-to-b from-brand/5 to-card/80"
          : "border-white/8 bg-card/70 hover:border-white/15",
        className,
      )}
    >
      <div className="relative h-40 overflow-hidden rounded-xl border border-white/5 bg-background/80">
        {visual}
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {description}
        </p>
      </div>
    </article>
  );
}

function ChatVisual() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-5">
      <div className="ms-auto max-w-[75%] rounded-2xl rounded-se-sm border border-white/10 bg-white/4 px-3.5 py-2 text-xs text-foreground/80">
        إزاي أعمل optimistic update في React Query؟
      </div>
      <div className="me-auto max-w-[80%] rounded-2xl rounded-ss-sm border border-brand/25 bg-brand/8 px-3.5 py-2 text-xs text-foreground/90">
        استخدم <code className="text-brand">onMutate</code> callback…
      </div>
      <div className="me-auto flex max-w-[40%] items-center gap-1 rounded-2xl rounded-ss-sm border border-brand/25 bg-brand/8 px-3.5 py-2">
        <span className="size-1.5 animate-pulse rounded-full bg-brand" />
        <span
          className="size-1.5 animate-pulse rounded-full bg-brand"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="size-1.5 animate-pulse rounded-full bg-brand"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

function CodeReviewVisual() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-1 p-5 font-mono text-[11px] leading-relaxed">
      <p className="text-muted-foreground">
        <span className="text-brand">const</span> data = useQuery()
      </p>
      <p className="flex items-start gap-2">
        <span className="mt-0.5 text-amber-400">⚠</span>
        <span className="text-amber-300/80">missing dependency array</span>
      </p>
      <p className="text-muted-foreground">
        useEffect(() =&gt; {"{"}…{"}"}, <span className="text-emerald-300">[userId]</span>)
      </p>
      <p className="flex items-start gap-2">
        <span className="mt-0.5 text-emerald-400">✓</span>
        <span className="text-emerald-300/80">type inference is clean</span>
      </p>
    </div>
  );
}

function KnowledgeBaseVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="flex items-center justify-center gap-3">
          {["docs", "rules", "specs"].map((label, i) => (
            <div
              key={label}
              className="flex size-14 flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/3 text-[10px] text-muted-foreground"
              style={{
                animation: `glow-pulse ${2.4 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
              }}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5 text-brand/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
                <path d="M14 2v6h6" />
              </svg>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <svg
          aria-hidden
          viewBox="0 0 200 80"
          className="absolute -bottom-10 inset-s-1/2 h-10 w-48 -translate-x-1/2"
        >
          <path
            d="M20 5 Q100 60 180 5"
            stroke="color-mix(in srgb, var(--brand) 35%, transparent)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3 4"
          />
        </svg>
      </div>
    </div>
  );
}

function DebugVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex size-20 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/6 text-rose-400">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="8" y="6" width="8" height="12" rx="4" />
          <path d="M12 2v2M4 9h4M16 9h4M4 15h4M16 15h4M12 18v3" />
        </svg>
        <span
          className="absolute inset-0 rounded-full border border-rose-400/40"
          style={{ animation: "glow-pulse 2s ease-in-out infinite" }}
        />
      </div>
      <div className="absolute inset-x-6 bottom-5 rounded-md border border-white/10 bg-white/3 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span className="text-emerald-400">→</span> why it happens + how to avoid
      </div>
    </div>
  );
}

export async function CoreFeatures() {
  const t = await getTranslations();

  return (
    <section
      id="features"
      className="relative bg-background py-24 sm:py-32 lg:py-40"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading
          title={t("features-title")}
          subtitle={t("features-subtitle")}
        />

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:mt-20 lg:gap-6">
          <FeatureCard
            title={t("features-1-title")}
            description={t("features-1-desc")}
            visual={<ChatVisual />}
          />
          <FeatureCard
            title={t("features-2-title")}
            description={t("features-2-desc")}
            visual={<CodeReviewVisual />}
            featured
          />
          <FeatureCard
            title={t("features-3-title")}
            description={t("features-3-desc")}
            visual={<KnowledgeBaseVisual />}
          />
          <FeatureCard
            title={t("features-4-title")}
            description={t("features-4-desc")}
            visual={<DebugVisual />}
          />
        </div>
      </div>
    </section>
  );
}
