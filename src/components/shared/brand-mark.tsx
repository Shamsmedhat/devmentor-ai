import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  showWordmark = false,
  className,
}: BrandMarkProps) {
  // Variables
  const variant = SIZES[size];

  const mark = (
    <span className={cn("inline-flex items-center", variant.wrap, className)}>
      <Image
        src="/devmentor_ai_logo.png"
        alt="DevMentor AI"
        width={300}
        height={0}
      />
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
