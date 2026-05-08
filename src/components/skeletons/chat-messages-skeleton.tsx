"use client";

import { cn } from "@/lib/utils";

interface ChatMessagesSkeletonProps {
  className?: string;
}

export function ChatMessagesSkeleton({ className }: ChatMessagesSkeletonProps) {
  return (
    <div
      className={cn(
        "chat-scrollbar flex flex-1 flex-col px-6 py-6",
        className,
      )}
      aria-hidden
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        <AssistantBlock lines={3} />
        <UserBlock widthClass="w-[52%]" />
        <AssistantBlock lines={2} wide />
      </div>
    </div>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/[0.07]",
        className,
      )}
    />
  );
}

function AssistantBlock({
  lines,
  wide,
}: {
  lines: number;
  wide?: boolean;
}) {
  return (
    <div className="flex w-full justify-start">
      <div className="flex w-full max-w-[min(100%,42rem)] flex-col gap-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBar
            key={i}
            className={cn(
              "h-3.5",
              i === lines - 1
                ? wide
                  ? "w-4/5"
                  : "w-3/5"
                : "w-full",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function UserBlock({ widthClass }: { widthClass: string }) {
  return (
    <div className="flex w-full justify-end">
      <SkeletonBar className={cn("h-11 rounded-xl", widthClass)} />
    </div>
  );
}
