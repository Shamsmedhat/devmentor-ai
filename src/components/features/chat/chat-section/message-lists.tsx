import type { Components } from "streamdown";

import { cn } from "@/lib/utils";

// Streamdown's lists are list-inside with physical pl-*, so a long item
// runs on as one line and the marker pads the wrong side in Arabic (RTL).
// Hanging markers + logical padding keep wrapped lines aligned in both directions.

export const MessageOrderedList: NonNullable<Components["ol"]> = ({
  className,
  node: _node,
  ...props
}) => (
  <ol
    className={cn(
      "my-1 list-outside list-decimal space-y-4 ps-6 marker:font-semibold marker:text-foreground",
      className,
    )}
    {...props}
  />
);

export const MessageUnorderedList: NonNullable<Components["ul"]> = ({
  className,
  node: _node,
  ...props
}) => (
  <ul
    className={cn(
      "my-1 list-outside list-disc space-y-1 ps-5 marker:text-muted-foreground",
      className,
    )}
    {...props}
  />
);

export const MessageListItem: NonNullable<Components["li"]> = ({
  className,
  node: _node,
  ...props
}) => (
  <li
    className={cn(
      "leading-relaxed [&>p]:inline [&>ol]:mt-1.5 [&>ul]:mt-1.5",
      className,
    )}
    {...props}
  />
);
