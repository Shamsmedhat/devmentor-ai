"use client";

import { useState } from "react";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { MessageAction } from "@/components/ai-elements/message";

export default function CopyButton({ text }: { text: string }) {
  // Translation
  const t = useTranslations();

  // State - briefly flips to the "copied" affordance, then reverts after 2s.
  const [copied, setCopied] = useState(false);

  // Functions
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  // Variables
  const label = copied ? t("chat-copied") : t("chat-copy-action");

  return (
    <MessageAction
      onClick={handleCopy}
      tooltip={label}
      label={label}
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </MessageAction>
  );
}
