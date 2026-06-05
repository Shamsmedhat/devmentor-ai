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

function formatRetrievedContext(results: KnowledgeBaseSearchResult[]): string {
  return results
    .map((r) => {
      const meta = r.metadata ?? {};
      const source = (meta.document_id as string | undefined) ?? "unknown";
      const similarity = r.similarity.toFixed(3);

      if (meta.source_type === "video") {
        const title = (meta.video_title as string | undefined) ?? source;
        const start = formatMMSS(meta.start_seconds);
        const end = formatMMSS(meta.end_seconds);
        const driveAttr = meta.drive_url
          ? ` drive_url="${meta.drive_url}"`
          : "";
        return `<chunk type="video" title="${title}" start="${start}" end="${end}"${driveAttr} similarity="${similarity}">\n${r.content}\n</chunk>`;
      }

      return `<chunk source="${source}" similarity="${similarity}">\n${r.content}\n</chunk>`;
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
