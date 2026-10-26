/**
 * DELETE one document's chunks (`yarn kb:delete-doc <documentId>`).
 *
 * Removes every knowledge_base row whose metadata.document_id matches. Use it
 * when a task or doc is retired; to change a doc, edit the file and re-run
 * kb:ingest-doc with the same documentId instead.
 */
import { createAdminClient } from "@/lib/utils/supabase/admin";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main(): Promise<void> {
  const documentId = process.argv[2];
  if (!documentId) fail("Usage: yarn kb:delete-doc <documentId>");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("knowledge_base")
    .delete()
    .eq("metadata->>document_id", documentId)
    .select("id");
  if (error) fail(`Delete failed: ${error.message}`);

  const deleted = data?.length ?? 0;
  if (deleted === 0) fail(`No chunks found for document_id "${documentId}".`);

  console.log(`Deleted ${deleted} chunks for document_id "${documentId}".`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
