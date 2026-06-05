"use client";

import { useCallback, useState } from "react";

import { ingestVideoAction } from "@/lib/actions/ingest-video.action";

export type VideoIngestionStatus =
  | "idle"
  | "transcribing"
  | "done"
  | "error";

export type VideoIngestionProgress = {
  status: VideoIngestionStatus;
  videoTitle?: string;
  chunksCreated?: number;
  error?: string;
};

type UseVideoIngestionResult = {
  state: VideoIngestionProgress;
  isRunning: boolean;
  ingestVideo: (formData: FormData) => Promise<void>;
  reset: () => void;
};

const INITIAL_STATE: VideoIngestionProgress = { status: "idle" };

export function useVideoIngestion(): UseVideoIngestionResult {
  // State
  const [state, setState] = useState<VideoIngestionProgress>(INITIAL_STATE);
  const [isRunning, setIsRunning] = useState(false);

  // Functions
  const ingestVideo = useCallback(async (formData: FormData) => {
    setIsRunning(true);
    setState({ status: "transcribing" });

    const response = await ingestVideoAction(formData);

    if (response.success) {
      setState({
        status: "done",
        videoTitle: response.videoTitle,
        chunksCreated: response.chunksCreated,
      });
    } else {
      setState({ status: "error", error: response.error });
    }

    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setIsRunning(false);
  }, []);

  return { state, isRunning, ingestVideo, reset };
}
