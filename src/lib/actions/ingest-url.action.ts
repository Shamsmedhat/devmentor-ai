"use server";

import { chunkText } from "@/lib/ai/chunking";
import { generateEmbeddingsMany } from "@/lib/ai/embeddings";
import {
  ingestUrlInputSchema,
  type IngestUrlInput,
} from "@/lib/schemas/ingestion.schema";
import {
  FirecrawlScrapeError,
  scrapeUrl,
} from "@/lib/services/firecrawl.service";
import { getServerSupabaseAuth } from "@/lib/utils/auth/auth-server-guard";
import { isOwner } from "@/lib/utils/require-owner";
import { createAdminClient } from "@/lib/utils/supabase/admin";

export type UrlIngestionResult =
  | { url: string; status: "success"; chunksCreated: number }
  | { url: string; status: "error"; error: string };

export type IngestUrlsResponse =
  | { success: true; results: UrlIngestionResult[] }
  | { success: false; error: string };

export async function ingestUrlsAction(
  input: IngestUrlInput,
): Promise<IngestUrlsResponse> {
  // Auth: fail fast before any expensive work
  const { user } = await getServerSupabaseAuth();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Owner-only: ingestion bypasses RLS via createAdminClient — restrict to owner.
  if (!isOwner(user)) {
    return { success: false, error: "Forbidden" };
  }

  // Validate
  const parsed = ingestUrlInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }

  const urls =
    parsed.data.mode === "single" ? [parsed.data.url] : parsed.data.urls;

  const adminSupabase = createAdminClient();
  const results: UrlIngestionResult[] = [];

  // Sequential: respect Firecrawl + Gemini rate limits.
  for (const url of urls) {
    try {
      const page = await scrapeUrl(url);

      const chunks = await chunkText(page.markdown);
      if (chunks.length === 0) {
        results.push({
          url,
          status: "error",
          error: "Scrape returned no chunkable content.",
        });
        continue;
      }

      const {
        embeddings,
        usage: embeddingUsage,
        providerMetadata,
      } = await generateEmbeddingsMany(chunks);

      // Overwrite: delete any prior chunks for this URL before inserting new ones.
      const { error: deleteError } = await adminSupabase
        .from("knowledge_base")
        .delete()
        .eq("metadata->>document_id", page.sourceUrl);

      if (deleteError) {
        throw new Error(`Delete prior chunks failed: ${deleteError.message}`);
      }

      const records = chunks.map((chunk, index) => ({
        content: chunk,
        embedding: embeddings[index],
        metadata: {
          document_id: page.sourceUrl,
          source_type: "url",
          title: page.title,
          embedding_usage: embeddingUsage,
          provider_metadata: providerMetadata,
        },
      }));

      const { error: insertError } = await adminSupabase
        .from("knowledge_base")
        .insert(records);

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      results.push({ url, status: "success", chunksCreated: chunks.length });
    } catch (error: unknown) {
      const message =
        error instanceof FirecrawlScrapeError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unknown error";
      console.error(`Ingest failed for ${url}:`, message);
      results.push({ url, status: "error", error: message });
    }
  }

  return { success: true, results };
}
