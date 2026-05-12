"use client";

import { CoinsIcon, FlagIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import type { ChatMessageMetadata } from "@/lib/types/chat";

interface MessageInsightsProps {
  metadata: ChatMessageMetadata;
}

export default function MessageInsights({ metadata }: MessageInsightsProps) {
  // Translation
  const t = useTranslations();

  // Variables
  const { finishReason, usage } = metadata;
  const hasUsage = Boolean(
    usage && (usage.inputTokens || usage.outputTokens || usage.totalTokens),
  );

  // Truncation is surfaced by TruncatedBanner above the input, not here.
  const showFinishStep = Boolean(finishReason) && finishReason !== "length";

  // Skip rendering for legacy messages without rich metadata, or when nothing
  // would render below.
  if (!hasUsage && !showFinishStep) return null;

  const finishCopy = finishReasonCopy(finishReason);

  return (
    <ChainOfThought className="mb-2">
      <ChainOfThoughtHeader>{t("chat-insights-header")}</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {hasUsage && (
          <ChainOfThoughtStep
            icon={CoinsIcon}
            label={t("chat-insights-tokens-label")}
            description={t("chat-insights-tokens-desc", {
              input: usage?.inputTokens ?? 0,
              output: usage?.outputTokens ?? 0,
              total: usage?.totalTokens ?? 0,
            })}
          />
        )}

        {showFinishStep && (
          <ChainOfThoughtStep
            icon={FlagIcon}
            label={t(finishCopy.labelKey)}
            description={t(finishCopy.descKey)}
          />
        )}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

// Helpers
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
