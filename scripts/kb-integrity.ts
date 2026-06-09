import { createAdminClient } from "@/lib/utils/supabase/admin";

const EXPECTED_DIMENSION = 768;
const DIM_SAMPLE_SIZE = 100;
const PAGE_SIZE = 1000;
const SMALLEST_SOURCES_TO_LIST = 10;

type MetadataRow = { metadata: Record<string, unknown> | null };
type EmbeddingSampleRow = { id: string; embedding: unknown };

async function main(): Promise<void> {
  const supabase = createAdminClient();

  // 1. Total chunk count
  const { count: totalChunks, error: countErr } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true });
  if (countErr) throw new Error(`Total count failed: ${countErr.message}`);

  // 2. Per-source counts (paginated through metadata->document_id)
  const sourceCounts = new Map<string, number>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("metadata")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Source page @${from} failed: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const row of data as MetadataRow[]) {
      const docId =
        (row.metadata?.document_id as string | undefined) ?? "<unknown>";
      sourceCounts.set(docId, (sourceCounts.get(docId) ?? 0) + 1);
    }

    if (data.length < PAGE_SIZE) break;
  }
  const sortedSources = [...sourceCounts.entries()].sort((a, b) => a[1] - b[1]);

  // 3a. NULL embedding count (real failure mode)
  const { count: nullEmbeddings, error: nullErr } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true })
    .is("embedding", null);
  if (nullErr)
    throw new Error(`NULL-embedding count failed: ${nullErr.message}`);

  // 3b. Dimension sample (~100 rows)
  const { data: sample, error: sampleErr } = await supabase
    .from("knowledge_base")
    .select("id, embedding")
    .limit(DIM_SAMPLE_SIZE);
  if (sampleErr)
    throw new Error(`Embedding sample failed: ${sampleErr.message}`);

  const dimViolations: Array<{ id: string; dim: number }> = [];
  for (const row of (sample ?? []) as EmbeddingSampleRow[]) {
    const dim = embeddingDim(row.embedding);
    if (dim !== EXPECTED_DIMENSION) {
      dimViolations.push({ id: row.id, dim });
    }
  }

  // 4. Empty/null content count
  const { count: emptyContent, error: emptyErr } = await supabase
    .from("knowledge_base")
    .select("*", { count: "exact", head: true })
    .or("content.is.null,content.eq.");
  if (emptyErr)
    throw new Error(`Empty-content count failed: ${emptyErr.message}`);

  // Summary
  console.log("\n=== KB Integrity Summary ===");
  console.log(`Total chunks:                ${totalChunks ?? 0}`);
  console.log(
    `DISTINCT SOURCES:            ${sourceCounts.size}   (expected ~198 URLs - gap means silent ingestion failures)`,
  );
  console.log(`NULL embeddings:             ${nullEmbeddings ?? 0}`);
  console.log(`Empty/null content rows:     ${emptyContent ?? 0}`);
  console.log(
    `Dim sample size:             ${(sample ?? []).length} / expected dim ${EXPECTED_DIMENSION}`,
  );
  console.log(`Dim violations in sample:    ${dimViolations.length}`);
  if (dimViolations.length > 0) {
    for (const v of dimViolations.slice(0, 10)) {
      console.log(`  - ${v.id}: dim=${v.dim}`);
    }
  }

  console.log(
    `\nTop ${SMALLEST_SOURCES_TO_LIST} smallest sources (partial ingestion suspects):`,
  );
  for (const [src, n] of sortedSources.slice(0, SMALLEST_SOURCES_TO_LIST)) {
    console.log(`  ${String(n).padStart(4)}  ${src}`);
  }
  console.log();
}

function embeddingDim(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string") {
    const trimmed = value.replace(/^\[|\]$/g, "");
    if (trimmed.length === 0) return 0;
    return trimmed.split(",").length;
  }
  return 0;
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
