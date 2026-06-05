import { z } from "zod";

import { urlSchema } from "./ingestion.schema";

const MAX_VIDEO_TITLE_LENGTH = 200;

export const videoTitleSchema = z
  .string()
  .trim()
  .min(1, { message: "Video title is required." })
  .max(MAX_VIDEO_TITLE_LENGTH, {
    message: `Video title must be at most ${MAX_VIDEO_TITLE_LENGTH} characters.`,
  });

export const ingestVideoInputSchema = z.object({
  video_title: videoTitleSchema,
  drive_url: urlSchema.optional(),
});

export type IngestVideoInput = z.infer<typeof ingestVideoInputSchema>;
