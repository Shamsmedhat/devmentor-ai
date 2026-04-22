"use client";

import { forwardRef, useEffect, type KeyboardEvent } from "react";

import { useTranslations } from "next-intl";
import { ArrowUp, Paperclip } from "lucide-react";

import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onAttachClick: () => void;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  function ChatInput(
    { input, isLoading, onInputChange, onSubmit, onAttachClick },
    ref,
  ) {
    // Translation
    const t = useTranslations();

    // Auto-resize textarea on input change
    useEffect(() => {
      const textarea =
        ref && "current" in ref ? ref.current : null;
      if (!textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, [input, ref]);

    // Functions
    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isLoading && input.trim()) {
          onSubmit();
        }
      }
    }

    const canSend = input.trim().length > 0 && !isLoading;

    return (
      <div className="border-t border-white/5 p-4">
        <div
          className={cn(
            "rounded-2xl border border-white/8 bg-[#0D1117] transition-colors",
            "hover:border-white/15",
            "focus-within:border-cyan-500/30",
          )}
        >
          {/* Textarea */}
          <textarea
            ref={ref}
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t("chat-placeholder")}
            dir="auto"
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent px-4 pb-2 pt-4 outline-none",
              "min-h-[52px] max-h-[200px] overflow-y-auto",
              "text-sm text-white/90 placeholder:text-white/25",
              "chat-scrollbar",
            )}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Hint text */}
            <span className="text-[11px] text-white/20">{t("chat-send-hint")}</span>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {/* Attach button */}
              <button
                type="button"
                onClick={onAttachClick}
                className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-white/4 hover:text-white/60"
                aria-label={t("chat-attach-soon")}
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Send button */}
              <button
                type="button"
                onClick={() => onSubmit()}
                disabled={!canSend}
                className={cn(
                  "rounded-xl p-2 transition-all",
                  canSend
                    ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_16px_rgba(0,212,255,0.25)]"
                    : "cursor-not-allowed bg-white/6 text-white/30 opacity-30",
                )}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
