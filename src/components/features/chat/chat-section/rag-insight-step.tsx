"use client";

import { useState } from "react";

import { ChevronDownIcon, DatabaseIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import LtrValue from "@/components/shared/ltr-value";
import type { RagSource } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_SOURCES = 5;

interface RagInsightStepProps {
  sources: RagSource[];
}

export default function RagInsightStep({ sources }: RagInsightStepProps) {
  // Translation
  const t = useTranslations();

  // State - collapsed by default: RAG runs on most turns, keep it compact.
  const [isOpen, setIsOpen] = useState(false);

  // Variables
  const visibleSources = sources.slice(0, MAX_VISIBLE_SOURCES);

  return (
    <div className="flex gap-2 text-sm text-muted-foreground fade-in-0 slide-in-from-top-2 animate-in">
      <div className="relative mt-0.5">
        <DatabaseIcon className="size-4" />
        <div className="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border" />
      </div>

      <div className="flex-1 overflow-hidden">
        <Collapsible
          onOpenChange={setIsOpen}
          open={isOpen}
        >
          <CollapsibleTrigger className="flex w-full items-center gap-2 transition-colors hover:text-foreground">
            <span className="flex-1 text-start">
              {t("chat-insights-rag-label", { count: sources.length })}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                isOpen ? "rotate-180" : "rotate-0",
              )}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 space-y-1.5 text-xs">
            {visibleSources.map((source) => (
              // Label can be an Arabic video title or an English file name -
              // dir="auto" lets each resolve its own direction; the similarity
              // % and timestamp stay LTR.
              <div
                key={source.id}
                className="flex items-center gap-2"
              >
                {source.url ? (
                  <a
                    dir="auto"
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate underline-offset-2 hover:underline"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span
                    dir="auto"
                    className="flex-1 truncate"
                  >
                    {source.label}
                  </span>
                )}

                {source.timestamp && (
                  <LtrValue>
                    <span className="text-muted-foreground/80">
                      {source.timestamp}
                    </span>
                  </LtrValue>
                )}

                <LtrValue>
                  <span className="shrink-0 tabular-nums text-muted-foreground/80">
                    {Math.round(source.similarity * 100)}%
                  </span>
                </LtrValue>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
