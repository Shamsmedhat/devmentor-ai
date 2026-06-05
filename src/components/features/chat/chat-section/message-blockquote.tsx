import type { Components } from "streamdown";

import { cn } from "@/lib/utils";

// RTL-aware citation highlight used for video watch references
export const MessageBlockquote: NonNullable<Components["blockquote"]> = ({
  className,
  children,
  ...props
}) => (
  <blockquote
    className={cn(
      "border-e-4 border-primary rounded-md bg-primary/10 py-2 pe-3 ps-4 not-italic",
      className,
    )}
    {...props}
  >
    {children}
  </blockquote>
);
