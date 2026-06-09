"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useVideoIngestion,
  type VideoIngestionStatus,
} from "@/hooks/use-video-ingestion";
import { ingestVideoInputSchema } from "@/lib/schemas/video-ingestion.schema";

const STATUS_VARIANT: Record<
  VideoIngestionStatus,
  "secondary" | "default" | "destructive" | "outline"
> = {
  idle: "outline",
  transcribing: "secondary",
  done: "default",
  error: "destructive",
};

export default function VideoIngestionForm() {
  // State
  const [file, setFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Hooks
  const { state, isRunning, ingestVideo, reset } = useVideoIngestion();

  // Functions
  async function handleSubmit() {
    setFormError(null);
    reset();

    if (!file) {
      setFormError("No audio file selected.");
      return;
    }

    const validation = ingestVideoInputSchema.safeParse({
      video_title: videoTitle,
      drive_url: driveUrl.trim().length > 0 ? driveUrl : undefined,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("video_title", validation.data.video_title);
    if (validation.data.drive_url) {
      formData.append("drive_url", validation.data.drive_url);
    }

    await ingestVideo(formData);
  }

  return (
    <div className="flex flex-col gap-4 text-amber-100">
      <Input
        type="text"
        placeholder="Video title (used as the citation source)"
        value={videoTitle}
        onChange={(e) => setVideoTitle(e.target.value)}
        disabled={isRunning}
      />

      <Input
        type="url"
        placeholder="Drive URL (optional)"
        value={driveUrl}
        onChange={(e) => setDriveUrl(e.target.value)}
        disabled={isRunning}
      />

      <Input
        type="file"
        accept=".mp3,audio/mpeg"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={isRunning}
      />

      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={isRunning}
        className="bg-amber-100 text-black hover:bg-amber-200"
      >
        {isRunning ? "Transcribing..." : "Ingest lecture"}
      </Button>

      <p className="text-xs text-amber-100/60">
        Transcription can take a few minutes for long lectures - keep this tab
        open.
      </p>

      {formError && <p className="text-sm text-red-400">{formError}</p>}

      {state.status !== "idle" && (
        <div className="flex items-center justify-between gap-3 rounded border border-amber-100/20 p-2 text-sm">
          <span className="truncate">
            {state.videoTitle ?? videoTitle ?? "lecture"}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {state.status === "done" && state.chunksCreated !== undefined && (
              <span className="text-xs text-amber-100/70">
                {state.chunksCreated} chunks
              </span>
            )}
            {state.status === "error" && state.error && (
              <span
                className="max-w-60 truncate text-xs text-red-400"
                title={state.error}
              >
                {state.error}
              </span>
            )}
            <Badge variant={STATUS_VARIANT[state.status]}>{state.status}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
