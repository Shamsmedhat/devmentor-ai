"use client";

import { CoinsIcon, FlagIcon, GlobeIcon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import LtrValue from "@/components/shared/ltr-value";
import type { ChatMessageMetadata } from "@/lib/types/chat";
import RagInsightStep from "./rag-insight-step";

interface MessageInsightsProps {
  metadata?: ChatMessageMetadata;
  /** True while this turn is still streaming - drives the live "in progress"
   *  state (panel visible from the start, grounding shown as "searching…"). */
  isStreaming?: boolean;
}

export default function MessageInsights({
  metadata = {},
  isStreaming = false,
}: MessageInsightsProps) {
  // Translation
  const t = useTranslations();

  // Variables
  const { finishReason, usage, grounding, rag } = metadata;
  const hasUsage = Boolean(
    usage && (usage.inputTokens || usage.outputTokens || usage.totalTokens),
  );

  // Truncation is surfaced by TruncatedBanner above the input, not here.
  const showFinishStep = Boolean(finishReason) && finishReason !== "length";

  // Grounding only fired when the model actually ran a web search. Sources
  // stream in live, so this flips on mid-stream (source-driven trigger).
  const showGrounding = Boolean(
    grounding && (grounding.queries.length || grounding.sources.length),
  );

  // Knowledge-base retrieval - present from the first emit when chunks matched.
  const showRag = Boolean(rag && rag.sources.length);

  // While streaming the panel stays mounted (with a live "generating" step) so
  // it's visible from the start; after finish we skip it when nothing rich
  // would render (also hides it for legacy messages).
  if (
    !isStreaming &&
    !hasUsage &&
    !showFinishStep &&
    !showGrounding &&
    !showRag
  ) {
    return null;
  }

  const finishCopy = finishReasonCopy(finishReason);

  return (
    <ChainOfThought className="mb-2">
      <ChainOfThoughtHeader>{t("chat-insights-header")}</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {isStreaming && (
          <ChainOfThoughtStep
            icon={SparklesIcon}
            status="active"
            label={t("chat-insights-generating-label")}
          />
        )}

        {showRag && rag && <RagInsightStep sources={rag.sources} />}

        {hasUsage && (
          <ChainOfThoughtStep
            icon={CoinsIcon}
            label={t("chat-insights-tokens-label")}
            description={
              <LtrValue>
                {t("chat-insights-tokens-desc", {
                  input: usage?.inputTokens ?? 0,
                  output: usage?.outputTokens ?? 0,
                  total: usage?.totalTokens ?? 0,
                })}
              </LtrValue>
            }
          />
        )}

        {showFinishStep && (
          <ChainOfThoughtStep
            icon={FlagIcon}
            label={t(finishCopy.labelKey)}
            description={t(finishCopy.descKey)}
          />
        )}

        {showGrounding && grounding && (
          <ChainOfThoughtStep
            icon={GlobeIcon}
            status={isStreaming ? "active" : "complete"}
            label={t(
              isStreaming
                ? "chat-insights-grounding-label-active"
                : "chat-insights-grounding-label",
            )}
          >
            {grounding.queries.length > 0 && (
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">
                  {t("chat-insights-grounding-queries-label")}
                </span>
                <ChainOfThoughtSearchResults>
                  {grounding.queries.map((query) => (
                    // Queries come back in the question's language (ar or en);
                    // dir="auto" lets each resolve its own direction.
                    <ChainOfThoughtSearchResult
                      key={query}
                      dir="auto"
                    >
                      {query}
                    </ChainOfThoughtSearchResult>
                  ))}
                </ChainOfThoughtSearchResults>
              </div>
            )}

            {grounding.sources.length > 0 && (
              <ChainOfThoughtSearchResults>
                {grounding.sources.map((source) => (
                  <ChainOfThoughtSearchResult
                    key={source.url}
                    asChild
                  >
                    <a
                      dir="ltr"
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title || hostnameOf(source.url)}
                    </a>
                  </ChainOfThoughtSearchResult>
                ))}
              </ChainOfThoughtSearchResults>
            )}
          </ChainOfThoughtStep>
        )}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

// Helpers
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function finishReasonCopy(reason: ChatMessageMetadata["finishReason"]) {
  switch (reason) {
    case "tool-calls":
      return {
        labelKey: "chat-insights-finish-tool-label",
        descKey: "chat-insights-finish-tool-desc",
      };
    case "content-filter":
      return {
        labelKey: "chat-insights-finish-filter-label",
        descKey: "chat-insights-finish-filter-desc",
      };
    case "error":
      return {
        labelKey: "chat-insights-finish-error-label",
        descKey: "chat-insights-finish-error-desc",
      };
    case "other":
      return {
        labelKey: "chat-insights-finish-other-label",
        descKey: "chat-insights-finish-other-desc",
      };
    default:
      return {
        labelKey: "chat-insights-finish-stop-label",
        descKey: "chat-insights-finish-stop-desc",
      };
  }
}
