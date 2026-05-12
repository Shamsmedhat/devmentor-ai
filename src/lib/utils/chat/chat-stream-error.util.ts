export type ChatStreamErrorPayload =
  | { kind: "rate-limit"; retryAfter?: number }
  | { kind: "generic" };

/**
 * Server-side: translates a streaming error from the AI provider into a small
 * JSON string that the client can parse. The AI SDK passes the return value
 * back to the browser as the message of an `Error`, so we keep it compact and
 * deterministic.
 *
 * Today Groq is the only provider, but the regex is provider-agnostic enough
 * (any "rate limit" / "try again in Xs" message will work).
 */
export function serializeChatStreamError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (/rate limit/i.test(message)) {
    const match = message.match(/try again in (\d+(?:\.\d+)?)s/i);
    const retryAfter = match ? Math.ceil(Number.parseFloat(match[1])) : undefined;
    return JSON.stringify({ kind: "rate-limit", retryAfter });
  }

  return JSON.stringify({ kind: "generic" });
}

/**
 * Client-side: parses the message of an error caught by `useChat({ onError })`.
 * Falls back to a generic kind whenever the message isn't our JSON envelope
 * (e.g. an aborted request, a network error, or a 5xx from the route itself).
 */
export function parseChatStreamError(message: string): ChatStreamErrorPayload {
  try {
    const parsed = JSON.parse(message) as ChatStreamErrorPayload;
    if (parsed && (parsed.kind === "rate-limit" || parsed.kind === "generic")) {
      return parsed;
    }
  } catch {
    /* fall through to generic */
  }
  return { kind: "generic" };
}
