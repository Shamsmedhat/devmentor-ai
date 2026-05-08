import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useChatUi } from "../chat-ui.context";

export default function ChatHeader() {
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

      {/* Locale switch */}
      <div className="flex items-center rounded-full border border-white/6 bg-white/4 p-0.5">
        {(["ar", "en"] as const).map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-all",
              locale === loc
                ? "bg-white/8 text-white"
                : "text-white/40 hover:text-white/70",
            )}
          >
            {loc === "ar" ? "AR" : "EN"}
          </button>
        ))}
      </div>
    </header>
  );
}
