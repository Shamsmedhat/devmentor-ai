import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { wrap: "gap-2", icon: "size-6", text: "text-sm" },
  md: { wrap: "gap-2.5", icon: "size-7", text: "text-base" },
  lg: { wrap: "gap-3", icon: "size-10", text: "text-2xl" },
} as const;

interface BrandMarkProps {
  size?: keyof typeof SIZES;
  /** When set, the mark becomes a locale-aware link (used as the home link). */
  href?: string;
  /** Icon-only when false. */
  showWordmark?: boolean;
  className?: string;
}

export default function BrandMark({
  size = "sm",
  href,
  showWordmark = true,
  className,
}: BrandMarkProps) {
  // Variables
  const variant = SIZES[size];

  const mark = (
    <span className={cn("inline-flex items-center", variant.wrap, className)}>
      <HexIcon className={cn(variant.icon, "shrink-0 text-brand")} />
      {showWordmark && (
        <span className={cn("font-semibold text-foreground", variant.text)}>
          DevMentor <span className="text-brand">AI</span>
        </span>
      )}
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="inline-flex items-center transition-opacity hover:opacity-80"
    >
      {mark}
    </Link>
  );
}

function HexIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L21.196 7V17L12 22L2.804 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L17.598 9.25V15.75L12 19L6.402 15.75V9.25L12 6Z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}
