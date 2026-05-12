"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { GlobeIcon } from "lucide-react";
import { useChatUi } from "../../../../lib/context/chat-ui.context";
import { cn } from "@/lib/utils";

export default function ChatHeader({
  setIsArabicResponse,
  isArabicResponse,
}: {
  setIsArabicResponse: (isArabicResponse: boolean) => void;
  isArabicResponse: boolean;
}) {
  // Translation
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Hooks
  const { currentTitle } = useChatUi();

  // Functions
  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground/80">
          {currentTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Response language switch */}
        <button
          type="button"
          onClick={() => setIsArabicResponse(!isArabicResponse)}
          aria-label="Toggle response language"
          aria-pressed={isArabicResponse}
          className="inline-flex items-center rounded-full border border-border bg-muted p-0.5 text-xs"
        >
          <span
            className={cn(
              isArabicResponse
                ? "bg-background text-foreground"
                : "text-muted-foreground",
              "rounded-full px-2.5 py-1 transition-all duration-300 ease-out",
            )}
          >
            AR Text
          </span>
          <span
            className={cn(
              !isArabicResponse
                ? "bg-background text-foreground"
                : "text-muted-foreground",
              "rounded-full px-2.5 py-1 transition-all duration-300 ease-out",
            )}
          >
            EN Text
          </span>
        </button>

        {/* Locale dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              aria-label="Change locale"
            >
              <GlobeIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            align="end"
          >
            {(["ar", "en"] as const).map((loc) => (
              <DropdownMenuItem
                key={loc}
                onClick={() => switchLocale(loc)}
                className="cursor-pointer "
              >
                {loc === "ar" ? "Arabic (AR)" : "English (EN)"}
                {locale === loc ? " • Active" : ""}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
