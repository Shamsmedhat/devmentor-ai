import { generateText } from "ai";

import { getLatestUserMessageText } from "@/lib/ai/helpers";
import { QUERY_REWRITE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getActiveChatProvider } from "@/lib/ai/providers";
import type { ChatUIMessage } from "@/lib/types/chat";

/** Recent turns handed to the rewriter so it can resolve a follow-up's
 *  references without bloating the prompt. */
const REWRITE_HISTORY_TURNS = 6;
/** Assistant turns get long; the rewriter only needs the gist to resolve a
 *  reference, so each turn is clipped. */
const REWRITE_MAX_TURN_CHARS = 300;
/** The output is one short line - cap it so a misbehaving model can't run on. */
const REWRITE_MAX_OUTPUT_TOKENS = 100;

/**
 * Rewrites the latest user message into a single standalone vector-search query,
 * resolving follow-up references ("دي" / "this" / pronouns / ellipsis) against
 * recent history.
 *
 * The result is used ONLY for the KB search embedding. It never replaces the
 * message sent to the model and never influences the reply's language or content.
 *
 * Runs on the first message too: a self-contained question still needs the
 * domain anchoring ("ايليفيت" / bare "السبرنت" -> Rose App) to hit the KB.
 *
 * Fail-open: no latest message returns "", and every other miss (empty model
 * output, LLM error) returns the raw latest message so retrieval still runs on
 * something real rather than nothing.
 */
export async function rewriteToStandaloneQuery(
  messages: ChatUIMessage[],
): Promise<string> {
  const latest = getLatestUserMessageText(messages);
  if (!latest) return "";

  const provider = getActiveChatProvider();

  try {
    const { text } = await generateText({
      model: provider.createModel(),
      system: QUERY_REWRITE_SYSTEM_PROMPT,
      prompt: buildTranscript(messages),
      maxOutputTokens: REWRITE_MAX_OUTPUT_TOKENS,
      maxRetries: 0,
      // The provider's options keep thinking off/minimal - with a 100-token cap,
      // thinking tokens can starve the query (empty text -> raw-query fallback).
      ...provider.streamOptions,
    });

    const rewritten = text.trim();
    return rewritten || latest;
  } catch (error) {
    console.error("[query-rewrite] failed", error);
    return latest;
  }
}

/**
 * Compact text transcript of the last few turns - text parts only, long turns
 * clipped. Passing the raw UI messages (attachments, tool/source parts,
 * metadata) would only add noise to a reference-resolution task.
 */
function buildTranscript(messages: ChatUIMessage[]): string {
  return messages
    .slice(-REWRITE_HISTORY_TURNS)
    .map((message) => {
      const text = extractMessageText(message);
      if (!text) return "";

      const role = message.role === "user" ? "User" : "Assistant";
      const clipped =
        text.length > REWRITE_MAX_TURN_CHARS
          ? `${text.slice(0, REWRITE_MAX_TURN_CHARS)}…`
          : text;

      return `${role}: ${clipped}`;
    })
    .filter(Boolean)
    .join("\n");
}

function extractMessageText(message: ChatUIMessage): string {
  if (!Array.isArray(message.parts)) return "";

  return message.parts
    .map((part) => (part.type === "text" ? (part.text ?? "") : ""))
    .join("")
    .trim();
}
