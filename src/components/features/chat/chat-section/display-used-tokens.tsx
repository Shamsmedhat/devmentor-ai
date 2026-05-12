import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ChatUIMessage } from "@/lib/types/chat";

interface DisplayUsedTokensProps {
  showInsights: boolean;
  lastMessage: ChatUIMessage;
}

export default function DisplayUsedTokens({
  showInsights,
  lastMessage,
}: DisplayUsedTokensProps) {
  const t = useTranslations();
  return (
    <div
      aria-hidden={!showInsights}
      className={cn(
        "w-11/12 mx-auto overflow-hidden rounded-t-md border border-border bg-primary-foreground text-xs text-muted-foreground",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        showInsights
          ? "max-h-20 opacity-100 translate-y-0 p-1"
          : "max-h-0 opacity-0 -translate-y-1 p-0 border-transparent",
      )}
    >
      <div className="flex items-start gap-2">
        <InfoIcon className="w-4 h-4 shrink-0" />
        <h4 className="uppercase">{t("token-used")}</h4>
        {t("chat-insights-tokens-desc", {
          input: lastMessage?.metadata?.usage?.inputTokens ?? 0,
          output: lastMessage?.metadata?.usage?.outputTokens ?? 0,
          total: lastMessage?.metadata?.usage?.totalTokens ?? 0,
        })}
      </div>
    </div>
  );
}
