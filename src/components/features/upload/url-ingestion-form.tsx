"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useUrlIngestion,
  type UrlIngestionStatus,
} from "@/hooks/use-url-ingestion";
import { batchUrlsSchema, urlSchema } from "@/lib/schemas/ingestion.schema";

type Mode = "single" | "batch";

const STATUS_VARIANT: Record<
  UrlIngestionStatus,
  "secondary" | "default" | "destructive" | "outline"
> = {
  pending: "outline",
  scraping: "secondary",
  done: "default",
  error: "destructive",
};

export default function UrlIngestionForm() {
  // State
  const [mode, setMode] = useState<Mode>("single");
  const [singleUrl, setSingleUrl] = useState("");
  const [batchText, setBatchText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Hooks
  const { state, isRunning, ingestUrls, reset } = useUrlIngestion();

  // Functions
  function parseBatch(text: string): string[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  async function handleSubmit() {
    setFormError(null);
    reset();

    if (mode === "single") {
      const result = urlSchema.safeParse(singleUrl);
      if (!result.success) {
        setFormError(result.error.issues[0].message);
        return;
      }
      await ingestUrls([result.data]);
      return;
    }

    const urls = parseBatch(batchText);
    const result = batchUrlsSchema.safeParse(urls);
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      return;
    }
    await ingestUrls(result.data);
  }

  return (
    <div className="flex flex-col gap-4 text-amber-100">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList>
          <TabsTrigger value="single">Single URL</TabsTrigger>
          <TabsTrigger value="batch">Batch</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-3">
          <Input
            type="url"
            placeholder="https://nextjs.org/docs/app/getting-started"
            value={singleUrl}
            onChange={(e) => setSingleUrl(e.target.value)}
            disabled={isRunning}
          />
        </TabsContent>

        <TabsContent value="batch" className="mt-3">
          <Textarea
            placeholder={"One URL per line (max 50)\nhttps://...\nhttps://..."}
            rows={6}
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            disabled={isRunning}
          />
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={isRunning}
        className="bg-amber-100 text-black hover:bg-amber-200"
      >
        {isRunning ? "Ingesting..." : "Ingest"}
      </Button>

      {formError && <p className="text-red-400 text-sm">{formError}</p>}

      {state.length > 0 && (
        <ul className="flex flex-col gap-2">
          {state.map((item) => (
            <li
              key={item.url}
              className="flex items-center justify-between gap-3 rounded border border-amber-100/20 p-2 text-sm"
            >
              <span className="truncate">{item.url}</span>
              <div className="flex items-center gap-2 shrink-0">
                {item.status === "done" && item.chunksCreated !== undefined && (
                  <span className="text-xs text-amber-100/70">
                    {item.chunksCreated} chunks
                  </span>
                )}
                {item.status === "error" && item.error && (
                  <span
                    className="text-xs text-red-400 max-w-60 truncate"
                    title={item.error}
                  >
                    {item.error}
                  </span>
                )}
                <Badge variant={STATUS_VARIANT[item.status]}>
                  {item.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
