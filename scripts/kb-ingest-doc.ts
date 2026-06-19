/**
 * INGEST one local file (`yarn kb:ingest-doc <filePath> <documentId> [--source-type doc]`).
 *
 * A no-scrape sibling of kb-ingest for content that already lives on disk: reads
 * a local .md/.txt -> chunkText -> generateEmbeddingsMany -> overwrite
 * (delete-then-insert) into knowledge_base via the admin client. The overwrite
 * is keyed on the caller-supplied documentId, so re-running with the same id
 * cleanly replaces the prior chunks.
 *
 * Metadata is intentionally minimal: { document_id, source_type, title } where
 * title is the file's basename. No URL/scrape, no schema change.
 */
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import { chunkText } from "@/lib/ai/chunking";
import { generateEmbeddingsMany } from "@/lib/ai/embeddings";
import { createAdminClient } from "@/lib/utils/supabase/admin";

const DEFAULT_SOURCE_TYPE = "doc";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function readStringFlag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const raw = args[i + 1];
  if (!raw || raw.startsWith("--")) {
    fail(`${name} requires a value.`);
  }
  return raw;
}

function readNumberFlag(args: string[], name: string): number | undefined {
  const raw = readStringFlag(args, name);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) fail(`${name} must be a positive number.`);
  return n;
}

async function main(): Promise<void> {
  // Args
  const args = process.argv.slice(2);
  const positional = args.filter((arg) => !arg.startsWith("--"));
  const filePath = positional[0];
  const documentId = positional[1];
  if (!filePath || !documentId) {
    fail(
      "Usage: yarn kb:ingest-doc <filePath> <documentId> [--source-type doc]",
    );
  }

  const sourceType =
    readStringFlag(args, "--source-type") ?? DEFAULT_SOURCE_TYPE;

  // Input
  const absPath = resolve(process.cwd(), filePath);
  const title = basename(absPath);
  const text = readFileSync(absPath, "utf8");

  const chunkSize = readNumberFlag(args, "--chunk-size");
  const chunkOverlap = readNumberFlag(args, "--chunk-overlap");

  const chunks = await chunkText(text, chunkSize, chunkOverlap);
  if (chunks.length === 0) {
    fail(`Nothing to ingest: ${absPath} has no chunkable content.`);
  }

  console.log(
    `Ingesting "${title}" as document_id "${documentId}" (source_type "${sourceType}") - ${chunks.length} chunks.`,
  );

  // Embed
  const { embeddings, usage } = await generateEmbeddingsMany(chunks);

  // Build ALL records BEFORE delete+insert to minimize the non-transactional gap.
  const records = chunks.map((chunk, index) => ({
    content: chunk,
    embedding: embeddings[index],
    metadata: {
      document_id: documentId,
      source_type: sourceType,
      title,
    },
  }));

  // Overwrite: delete prior chunks for this document_id, then insert.
  const admin = createAdminClient();

  const { error: deleteError } = await admin
    .from("knowledge_base")
    .delete()
    .eq("metadata->>document_id", documentId);
  if (deleteError) {
    fail(`Delete prior chunks failed: ${deleteError.message}`);
  }

  const { error: insertError } = await admin
    .from("knowledge_base")
    .insert(records);
  if (insertError) {
    // LOUD: prior chunks are already gone and the replacement did not land.
    console.error(
      `!!! DATA LOSS: deleted prior chunks for ${documentId} but INSERT failed (${insertError.message}). Re-run to restore.`,
    );
    fail(`Insert failed: ${insertError.message}`);
  }

  // Summary
  console.log("\n=== kb:ingest-doc summary ===");
  console.log(`File:             ${absPath}`);
  console.log(`document_id:      ${documentId}`);
  console.log(`source_type:      ${sourceType}`);
  console.log(`Chunks inserted:  ${records.length}`);
  console.log(`Embedding tokens: ${usage.tokens}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
