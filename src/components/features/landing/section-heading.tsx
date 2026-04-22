import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl space-y-4",
        align === "center" && "text-center",
        align === "start" && "text-start",
        className,
      )}
    >
      <h2 className="text-balance text-4xl font-semibold tracking-tight text-primary-text sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-pretty text-base text-primary-muted sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
