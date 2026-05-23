"use client";

import { useCallback, useState } from "react";

import { ingestUrlsAction } from "@/lib/actions/ingest-url.action";

export type UrlIngestionStatus =
  | "pending"
  | "scraping"
  | "done"
  | "error";

export type UrlIngestionProgress = {
  url: string;
  status: UrlIngestionStatus;
  chunksCreated?: number;
  error?: string;
};

type UseUrlIngestionResult = {
  state: UrlIngestionProgress[];
  isRunning: boolean;
  ingestUrls: (urls: string[]) => Promise<void>;
  reset: () => void;
};

export function useUrlIngestion(): UseUrlIngestionResult {
  // State
  const [state, setState] = useState<UrlIngestionProgress[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Functions
  function updateOne(url: string, patch: Partial<UrlIngestionProgress>) {
    setState((prev) =>
      prev.map((item) => (item.url === url ? { ...item, ...patch } : item)),
    );
  }

  const ingestUrls = useCallback(async (urls: string[]) => {
    if (urls.length === 0) return;

    setIsRunning(true);
    setState(urls.map((url) => ({ url, status: "pending" })));

    // Sequential: one round-trip per URL so the UI shows progress per item.
    for (const url of urls) {
      updateOne(url, { status: "scraping" });

      const response = await ingestUrlsAction({ mode: "single", url });

      if (!response.success) {
        updateOne(url, { status: "error", error: response.error });
        continue;
      }

      const result = response.results[0];
      if (result.status === "success") {
        updateOne(url, {
          status: "done",
          chunksCreated: result.chunksCreated,
        });
      } else {
        updateOne(url, { status: "error", error: result.error });
      }
    }

    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setState([]);
    setIsRunning(false);
  }, []);

  return { state, isRunning, ingestUrls, reset };
}
