import { getLatestUserMessageText } from "@/lib/ai/helpers";
import { MENTOR_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  searchKnowledgeBase,
  type KnowledgeBaseSearchResult,
} from "@/lib/ai/search";
import { AI_LIMITS } from "@/lib/constants/ai.constant";
import type { ChatUIMessage } from "@/lib/types/chat";

/**
 * Runs the full RAG pipeline: extracts the latest user query, searches the
 * knowledge base, and returns either a RAG-augmented or base system prompt.
 *
 * A retrieval failure (e.g. transient pgvector error) degrades to the plain
 * mentor prompt instead of 500ing the route — the chat is more useful with
 * stale context than dead.
 */
export async function buildRagSystemPrompt(
  messages: ChatUIMessage[],
): Promise<string> {
  const query = getLatestUserMessageText(messages);
  if (!query) return MENTOR_SYSTEM_PROMPT;

  let results: KnowledgeBaseSearchResult[];
  try {
    results = await searchKnowledgeBase(
      query,
      AI_LIMITS.RAG_MAX_RESULTS,
      AI_LIMITS.RAG_SIMILARITY_THRESHOLD,
    );
  } catch (error) {
    console.error("[rag] searchKnowledgeBase failed", error);
    return MENTOR_SYSTEM_PROMPT;
  }

  if (results.length === 0) return MENTOR_SYSTEM_PROMPT;

  return RAG_SYSTEM_PROMPT(formatRetrievedContext(results));
}

function formatRetrievedContext(
  results: KnowledgeBaseSearchResult[],
): string {
  return results
    .map((r) => {
      const source = r.metadata?.document_id ?? "unknown";
      const similarity = r.similarity.toFixed(3);
      return `<chunk source="${source}" similarity="${similarity}">\n${r.content}\n</chunk>`;
    })
    .join("\n\n");
}
