import { MENTOR_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { searchKnowledgeBase } from "@/lib/ai/search";
import { getLatestUserMessageText } from "@/lib/ai/helpers";
import type { ChatUIMessage } from "@/lib/types/chat";

/**
 * Runs the full RAG pipeline: extracts the latest user query, searches the
 * knowledge base, and returns either a RAG-augmented or base system prompt.
 */
export async function buildRagSystemPrompt(
  messages: ChatUIMessage[],
): Promise<string> {
  const query = getLatestUserMessageText(messages);
  if (!query) return MENTOR_SYSTEM_PROMPT;

  const results = await searchKnowledgeBase(query, 10, 0.5);
  if (results.length === 0) return MENTOR_SYSTEM_PROMPT;

  const context = results
    .map(
      (r) => `[Source: ${r.metadata?.document_id ?? "unknown"}] ${r.content}`,
    )
    .join("\n\n");

  return RAG_SYSTEM_PROMPT(context);
}
