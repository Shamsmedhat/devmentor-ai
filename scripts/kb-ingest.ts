/**
 * Phase 2 - INGEST (`yarn kb:ingest <lib> [flags]`).
 *
 * Reads the human-reviewed kb-urls/<lib>.txt and runs the existing per-URL flow
 * for each line: scrapeUrl -> chunkText -> generateEmbeddingsMany -> overwrite
 * (delete-then-insert) into knowledge_base via the admin client. Metadata is
 * identical to the UI url path EXCEPT document_id, which is keyed on the
 * normalized INPUT url (see url-normalize.ts) so re-runs overwrite cleanly.
 *
 * Hardening over the UI path:
 * - Resume: completed ids are checkpointed to kb-urls/.progress/<lib>.json and
 *   skipped on re-run, so a dropped run continues instead of restarting.
 * - Skip-and-continue: a failed URL is logged to kb-urls/.failed/<lib>.txt and
 *   the run keeps going.
 * - Tighter overwrite: every record is built BEFORE delete+insert; an
 *   insert-after-delete failure logs LOUDLY (it means data loss until re-run).
 * - Cost log: end-of-run summary (pages scraped ~= Firecrawl credits, embedding
 *   tokens, chunks, elapsed) + an optional --max-pages guard.
 *
 * Flags:
 *   --max-pages N   stop cleanly after N pages scraped this run (resume-safe)
 *   --delay-ms N    sleep between URLs (default 500); on top of the embedder's
 *                   own 1s inter-batch delay
 *   --retry-failed  read kb-urls/.failed/<lib>.txt instead of <lib>.txt
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import { chunkText } from "@/lib/ai/chunking";
import { generateEmbeddingsMany } from "@/lib/ai/embeddings";
import { scrapeUrl } from "@/lib/services/firecrawl.service";
import { createAdminClient } from "@/lib/utils/supabase/admin";
import { normalizeUrl } from "@/lib/utils/url-normalize";

const KB_DIR = resolve(process.cwd(), "kb-urls");
const PROGRESS_DIR = resolve(KB_DIR, ".progress");
const FAILED_DIR = resolve(KB_DIR, ".failed");
const DEFAULT_DELAY_MS = 500;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function readNumberFlag(args: string[], name: string): number | undefined {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const raw = args[i + 1];
  const value = Number(raw);
  if (!raw || Number.isNaN(value)) {
    fail(`${name} requires a number (got "${raw ?? ""}").`);
  }
  return value;
}

function loadCompleted(progressPath: string): Set<string> {
  if (!existsSync(progressPath)) return new Set();
  try {
    const data = JSON.parse(readFileSync(progressPath, "utf8")) as {
      completed?: string[];
    };
    return new Set(data.completed ?? []);
  } catch {
    return new Set();
  }
}

function saveProgress(
  progressPath: string,
  lib: string,
  completed: Set<string>,
): void {
  // Atomic: write to a tmp file in the same dir, then rename over the target.
  const tmp = `${progressPath}.tmp`;
  const payload = {
    lib,
    completed: [...completed],
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(tmp, JSON.stringify(payload, null, 2) + "\n", "utf8");
  renameSync(tmp, progressPath);
}

async function main(): Promise<void> {
  // Args
  const args = process.argv.slice(2);
  const lib = args[0] && !args[0].startsWith("--") ? args[0] : undefined;
  if (!lib) {
    fail("Usage: yarn kb:ingest <lib> [--max-pages N] [--delay-ms N] [--retry-failed]");
  }

  const retryFailed = args.includes("--retry-failed");
  const maxPages = readNumberFlag(args, "--max-pages");
  const delayMs = readNumberFlag(args, "--delay-ms") ?? DEFAULT_DELAY_MS;

  // Paths
  const inputPath = retryFailed
    ? resolve(FAILED_DIR, `${lib}.txt`)
    : resolve(KB_DIR, `${lib}.txt`);
  const progressPath = resolve(PROGRESS_DIR, `${lib}.json`);
  const failedPath = resolve(FAILED_DIR, `${lib}.txt`);

  if (!existsSync(inputPath)) {
    fail(`Input list not found: ${inputPath}\nRun "yarn kb:map ${lib}" first (or drop --retry-failed).`);
  }

  mkdirSync(PROGRESS_DIR, { recursive: true });
  mkdirSync(FAILED_DIR, { recursive: true });

  // Input
  const urls = readFileSync(inputPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (urls.length === 0) {
    console.log(`Nothing to ingest: ${inputPath} is empty.`);
    return;
  }

  // Setup
  const admin = createAdminClient();
  const completed = loadCompleted(progressPath);
  const failed: string[] = [];

  let scraped = 0; // ~= Firecrawl credits consumed this run
  let succeeded = 0;
  let skipped = 0;
  let chunksInserted = 0;
  let embeddingTokens = 0;
  let stoppedEarly = false;
  const startedAt = Date.now();

  console.log(
    `Ingesting "${lib}" from ${inputPath} - ${urls.length} URLs (${completed.size} already done).`,
  );

  // Ingest
  for (const rawUrl of urls) {
    const id = normalizeUrl(rawUrl);

    if (completed.has(id)) {
      skipped++;
      continue;
    }

    if (maxPages != null && scraped >= maxPages) {
      stoppedEarly = true;
      break;
    }

    try {
      scraped++;
      const page = await scrapeUrl(rawUrl);

      const chunks = await chunkText(page.markdown);
      if (chunks.length === 0) {
        throw new Error("Scrape returned no chunkable content.");
      }

      const {
        embeddings,
        usage,
        providerMetadata,
      } = await generateEmbeddingsMany(chunks);
      embeddingTokens += usage.tokens;

      // Build ALL records BEFORE delete+insert to minimize the
      // non-transactional gap. Metadata matches the UI url path except the
      // normalized document_id.
      const records = chunks.map((chunk, index) => ({
        content: chunk,
        embedding: embeddings[index],
        metadata: {
          document_id: id,
          source_type: "url",
          title: page.title,
          embedding_usage: usage,
          provider_metadata: providerMetadata,
        },
      }));

      const { error: deleteError } = await admin
        .from("knowledge_base")
        .delete()
        .eq("metadata->>document_id", id);
      if (deleteError) {
        throw new Error(`Delete prior chunks failed: ${deleteError.message}`);
      }

      const { error: insertError } = await admin
        .from("knowledge_base")
        .insert(records);
      if (insertError) {
        // LOUD: prior chunks are already gone and the replacement did not land.
        console.error(
          `!!! DATA LOSS: deleted prior chunks for ${id} but INSERT failed (${insertError.message}). Re-run to restore.`,
        );
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      completed.add(id);
      saveProgress(progressPath, lib, completed);
      chunksInserted += records.length;
      succeeded++;
      console.log(`  ✓ ${rawUrl} → ${records.length} chunks`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`  ✗ ${rawUrl}: ${message}`);
      failed.push(rawUrl);
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  // Persist this run's failures (overwrite: reflects the latest attempt only).
  writeFileSync(failedPath, failed.length ? failed.join("\n") + "\n" : "", "utf8");

  // Summary
  const elapsedS = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log("\n=== kb:ingest summary ===");
  console.log(`Lib:                          ${lib}`);
  console.log(`Input:                        ${inputPath} (${urls.length} URLs)`);
  console.log(`Scraped (~Firecrawl credits): ${scraped}`);
  console.log(`Succeeded:                    ${succeeded}`);
  console.log(`Failed:                       ${failed.length}`);
  console.log(`Skipped (already done):       ${skipped}`);
  console.log(`Chunks inserted:              ${chunksInserted}`);
  console.log(`Embedding tokens:             ${embeddingTokens}`);
  console.log(`Elapsed:                      ${elapsedS}s`);
  if (stoppedEarly) {
    console.log(`\nStopped early at --max-pages ${maxPages}. Re-run to continue (resume-safe).`);
  }
  if (failed.length > 0) {
    console.log(`\nFailures written to: ${failedPath}`);
    console.log(`Retry only those with: yarn kb:ingest ${lib} --retry-failed`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
