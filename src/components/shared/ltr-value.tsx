import type { ReactNode } from "react";

interface LtrValueProps {
  children: ReactNode;
}

/**
 * Forces its children to render left-to-right and isolates them from the
 * surrounding bidi context. Use for values that are always LTR - token counts,
 * URLs, English search queries - so they don't garble inside an RTL (Arabic)
 * panel. Labels around it keep the document direction.
 */
export default function LtrValue({ children }: LtrValueProps) {
  return (
    <span
      dir="ltr"
      className="inline-block [unicode-bidi:isolate]"
    >
      {children}
    </span>
  );
}
