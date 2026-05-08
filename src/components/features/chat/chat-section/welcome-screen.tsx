"use client";

import type { RefObject } from "react";

import { useTranslations } from "next-intl";

import { usePromptInputController } from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

interface WelcomeScreenProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

export function WelcomeScreen({ inputRef }: WelcomeScreenProps) {
  // Translation
  const t = useTranslations();

  // Hooks
  const controller = usePromptInputController();

  // Variables
  const suggestions = [
    t("chat-suggestion-1"),
    t("chat-suggestion-2"),
    t("chat-suggestion-3"),
  ];

  // Functions
  function handleSuggestion(text: string) {
    controller.textInput.setInput(text);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      {/* Brain icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-chart-2/20 bg-chart-2/8">
        <BrainHexIcon className="h-10 w-10 text-chart-2" />
      </div>

      {/* Title */}
      <h2 className="mb-3 text-2xl font-semibold text-white">
        {t("chat-welcome-title")} 👋
      </h2>

      {/* Subtitle */}
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/50">
        {t("chat-welcome-subtitle")}
      </p>

      {/* Suggestion cards */}
      <Suggestions className="gap-3">
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion}
            onClick={() => handleSuggestion(suggestion)}
            className="rounded-xl border-white/15 bg-white/5 text-white/80 hover:border-cyan-500/30 hover:bg-white/10 hover:text-white"
            suggestion={suggestion}
            variant="outline"
          >
            {suggestion}
          </Suggestion>
        ))}
      </Suggestions>
    </div>
  );
}

function BrainHexIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 3L35.588 12V28L20 37L4.412 28V12L20 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 9L29.526 14.5V25.5L20 31L10.474 25.5V14.5L20 9Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M15 18C15 16.343 16.343 15 18 15H22C23.657 15 25 16.343 25 18V20C25 22.761 22.761 25 20 25C17.239 25 15 22.761 15 20V18Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M20 15V13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M20 27V25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M15 20H13"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M27 20H25"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
