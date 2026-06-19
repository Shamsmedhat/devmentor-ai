import { MENTOR_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { rewriteToStandaloneQuery } from "@/lib/ai/query-rewrite";
import {
  searchKnowledgeBase,
  type KnowledgeBaseSearchResult,
} from "@/lib/ai/search";
import { AI_LIMITS } from "@/lib/constants/ai.constant";
import type { ChatUIMessage, RagSource } from "@/lib/types/chat";

export type RagResult = {
  /** System prompt - RAG-augmented when chunks matched, base mentor otherwise. */
  system: string;
  /** Deduped, similarity-sorted sources for the insights panel (empty when none). */
  sources: RagSource[];
};

/**
 * Runs the full RAG pipeline: extracts the latest user query, searches the
 * knowledge base, and returns the system prompt plus the retrieved sources.
 *
 * A retrieval failure (e.g. transient pgvector error) degrades to the plain
 * mentor prompt instead of 500ing the route - the chat is more useful with
 * stale context than dead.
 */
export async function buildRagSystemPrompt(
  messages: ChatUIMessage[],
): Promise<RagResult> {
  const query = await rewriteToStandaloneQuery(messages);
  if (!query) return { system: MENTOR_SYSTEM_PROMPT, sources: [] };

  let results: KnowledgeBaseSearchResult[];
  try {
    results = await searchKnowledgeBase(
      query,
      AI_LIMITS.RAG_MAX_RESULTS,
      AI_LIMITS.RAG_SIMILARITY_THRESHOLD,
    );
  } catch (error) {
    console.error("[rag] searchKnowledgeBase failed", error);
    return { system: MENTOR_SYSTEM_PROMPT, sources: [] };
  }

  if (results.length === 0) {
    return { system: MENTOR_SYSTEM_PROMPT, sources: [] };
  }

  return {
    system: RAG_SYSTEM_PROMPT(formatRetrievedContext(results)),
    sources: extractRagSources(results),
  };
}

/**
 * Maps raw chunks to compact panel sources: dedupes PDF/text by document
 * (keeping the best-scoring chunk) while keeping video chunks distinct per
 * timestamp, then sorts by similarity (highest first).
 */
function extractRagSources(results: KnowledgeBaseSearchResult[]): RagSource[] {
  const byKey = new Map<string, RagSource>();

  for (const r of results) {
    const meta = r.metadata ?? {};
    const documentId = (meta.document_id as string | undefined) ?? "unknown";
    const sourceType = meta.source_type as string | undefined;
    const isVideo = sourceType === "video";

    const key = isVideo
      ? `video:${documentId}:${meta.start_seconds ?? ""}`
      : `doc:${documentId}`;

    const source: RagSource = isVideo
      ? {
          id: r.id,
          label: (meta.video_title as string | undefined) ?? documentId,
          sourceType,
          similarity: r.similarity,
          url: meta.drive_url as string | undefined,
          timestamp: formatMMSS(meta.start_seconds),
        }
      : {
          id: r.id,
          label: documentId,
          sourceType,
          similarity: r.similarity,
        };

    const existing = byKey.get(key);
    if (!existing || source.similarity > existing.similarity) {
      byKey.set(key, source);
    }
  }

  return [...byKey.values()].sort((a, b) => b.similarity - a.similarity);
}

function formatRetrievedContext(results: KnowledgeBaseSearchResult[]): string {
  return results
    .map((r) => {
      const meta = r.metadata ?? {};
      const source = (meta.document_id as string | undefined) ?? "unknown";
      // const similarity = r.similarity.toFixed(3);

      if (meta.source_type === "video") {
        const title = (meta.video_title as string | undefined) ?? source;
        const start = formatMMSS(meta.start_seconds);
        const end = formatMMSS(meta.end_seconds);
        const driveAttr = meta.drive_url
          ? ` drive_url="${meta.drive_url}"`
          : "";
        return `<chunk type="video" title="${title}" start="${start}" end="${end}"${driveAttr}>\n${r.content}\n</chunk>`;
      }

      return `<chunk source="${source}" >\n${r.content}\n</chunk>`;
    })
    .join("\n\n");
}

function formatMMSS(value: unknown): string {
  const seconds =
    typeof value === "number" && Number.isFinite(value) ? value : 0;
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
