import { z } from "zod";

const MAX_BATCH_URLS = 50;

export const urlSchema = z
  .string()
  .trim()
  .url({ message: "Must be a valid URL." })
  .refine(
    (value) => value.startsWith("http://") || value.startsWith("https://"),
    { message: "Only http and https URLs are allowed." },
  );

export const batchUrlsSchema = z
  .array(urlSchema)
  .min(1, { message: "Provide at least one URL." })
  .max(MAX_BATCH_URLS, {
    message: `At most ${MAX_BATCH_URLS} URLs per batch.`,
  });

export const ingestUrlInputSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("single"), url: urlSchema }),
  z.object({ mode: z.literal("batch"), urls: batchUrlsSchema }),
]);

export type IngestUrlInput = z.infer<typeof ingestUrlInputSchema>;
export type Url = z.infer<typeof urlSchema>;
