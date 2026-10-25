/**
 * Re-embed every knowledge_base row in place (`yarn kb:reembed`).
 *
 * Reads stored `content`, runs generateEmbeddingsMany, and UPDATEs `embedding`
 * per row. Use after changing the embedding model or its options - old and new
 * vectors cannot be mixed. Idempotent: a re-run just rewrites the same rows.
 */
import { generateEmbeddingsMany } from "@/lib/ai/embeddings";
import { createAdminClient } from "@/lib/utils/supabase/admin";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

type KnowledgeRow = {
  id: string;
  content: string;
};

async function main(): Promise<void> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("knowledge_base")
    .select("id, content");
  if (error) fail(`Load knowledge_base failed: ${error.message}`);

  const rows = (data ?? []) as KnowledgeRow[];
  if (rows.length === 0) fail("Nothing to re-embed: knowledge_base is empty.");

  console.log(`Re-embedding ${rows.length} chunks…`);

  const { embeddings, usage } = await generateEmbeddingsMany(
    rows.map((row) => row.content),
  );

  for (let i = 0; i < rows.length; i++) {
    const { error: updateError } = await admin
      .from("knowledge_base")
      .update({ embedding: embeddings[i] })
      .eq("id", rows[i].id);
    if (updateError) {
      fail(
        `Update failed at row ${i + 1}/${rows.length} (${rows[i].id}): ${updateError.message}. Re-run to finish the rest.`,
      );
    }
  }

  console.log("\n=== kb:reembed summary ===");
  console.log(`Chunks updated:   ${rows.length}`);
  console.log(`Embedding tokens: ${usage.tokens}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
