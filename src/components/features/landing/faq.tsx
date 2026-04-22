"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

const FAQ_ITEMS = [
  { q: "faq-q-1", a: "faq-a-1" },
  { q: "faq-q-2", a: "faq-a-2" },
  { q: "faq-q-3", a: "faq-a-3" },
  { q: "faq-q-4", a: "faq-a-4" },
  { q: "faq-q-5", a: "faq-a-5" },
  { q: "faq-q-6", a: "faq-a-6" },
] as const;

interface FAQItemProps {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, open, onToggle }: FAQItemProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/8 bg-primary-surface/60 transition",
        open && "border-secondary/25 bg-secondary/3",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start text-base font-medium text-primary-text transition hover:text-secondary sm:text-[17px]"
      >
        <span>{question}</span>
        <span
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-primary-muted transition",
            open && "rotate-45 border-secondary/40 text-secondary",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-primary-muted sm:text-[15px]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  // Translation
  const t = useTranslations();

  // State
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-primary py-24 sm:py-32 lg:py-40">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeading title={t("faq-title")} subtitle={t("faq-subtitle")} />

        <div className="mx-auto mt-14 max-w-3xl space-y-3 lg:mt-16">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem
              key={item.q}
              question={t(item.q)}
              answer={t(item.a)}
              open={openIndex === index}
              onToggle={() =>
                setOpenIndex((prev) => (prev === index ? null : index))
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
