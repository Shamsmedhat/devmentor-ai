import { AI_LIMITS } from "@/lib/constants/ai.constant";
import { createAdminClient } from "@/lib/utils/supabase/admin";
import { generateEmbeddings } from "./embeddings";

export type KnowledgeBaseSearchResult = {
  id: string;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

export async function searchKnowledgeBase(
  query: string,
  limit: number = AI_LIMITS.RAG_MAX_RESULTS,
  threshold: number = AI_LIMITS.RAG_SIMILARITY_THRESHOLD,
): Promise<KnowledgeBaseSearchResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const normalizedLimit = Math.max(1, Math.min(limit, 50));
  const normalizedThreshold = Math.min(Math.max(threshold, 0), 1);
  const adminSupabase = createAdminClient();

  const embeddings = await generateEmbeddings(normalizedQuery);

  const { data, error } = await adminSupabase.rpc("search_knowledge_base", {
    embedding: embeddings.embedding,
    match_count: normalizedLimit,
    threshold: normalizedThreshold,
  });

  if (error) {
    throw new Error(`Failed to search knowledge base: ${error.message}`);
  }

  return (data ?? []) as KnowledgeBaseSearchResult[];
}
