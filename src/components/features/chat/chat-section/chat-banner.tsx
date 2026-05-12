"use client";

import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatBannerProps {
  title: ReactNode;
  description: ReactNode;
}

export default function ChatBanner({ title, description }: ChatBannerProps) {
  return (
    <Alert className="mb-2 border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
      <TriangleAlert className="text-amber-600 dark:text-amber-400" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-amber-800/90 dark:text-amber-200/80">
        {description}
      </AlertDescription>
    </Alert>
  );
}
