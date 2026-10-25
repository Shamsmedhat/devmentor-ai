# Flow 1 — Chat request lifecycle

> Day 1. Files cited at real `file:line`. Code wins over any doc.

## A. Purpose
A user types a message → it streams back an AI reply with live "insights" (KB sources, web grounding, tokens) → both messages are saved to their session.

## B. The trace
Client → API → stream → persist.

| # | Hop | File:line | Moves to next |
|---|---|---|---|
| 1 | `useChat` mounted with `DefaultChatTransport({ api: "/api/chat" })`, seeded `initialMessages` | `rag-chatbot.tsx:71-72` | message list + `sendMessage` |
| 2 | `sendText()` fires AI immediately, persists the user msg in the background (fire-and-forget) | `rag-chatbot.tsx:117-137` | `sendMessage({ text })` → POST |
| 3 | `ChatInstance` keys `RAGChatBot` on `sessionId:chatInstanceKey` so New Chat / route change remounts cleanly | `chat-instance.tsx:25` | — |
| 4 | `POST` handler entry | `route.ts:27` | `request` |
| 5 | Guard: auth + per-user rate limit | `route.ts:29` → `route-guard.util.ts:15` | `guard.user` or early `Response` |
| 6 | Body parse + shape check (`messages` is array) | `route.ts:33-44` | `messages: ChatUIMessage[]` |
| 7 | Resolve active provider; 503 if its key env is missing | `route.ts:47-53` → `providers.ts:112` | `provider` |
| 8 | Normalize attachments to provider capabilities | `route.ts:57` → `normalize-ui-messages-for-model.ts:83` | `normalized` |
| 9 | Trim history (memory strategy) | `route.ts:64` → `memory.ts:39` | `trimmed` |
| 10 | **Build RAG system prompt + sources** (Flow 2) | `route.ts:70` → `rag.ts:25` | `{ system, sources }` |
| 11 | `convertToModelMessages(trimmed)` | `route.ts:73` | `modelMessages` |
| 12 | Log this request (best-effort) so it counts next window | `route.ts:77` → `rate-limit.ts:51` | — |
| 13 | `streamText(...)` — model, tools, system, `maxOutputTokens`, `maxRetries:0`, `stopWhen: stepCountIs(2)`, `smoothStream` | `route.ts:79-92` | `result` |
| 14 | `toUIMessageStreamResponse` with `sendReasoning:false` + progressive `messageMetadata` | `route.ts:113-169` | streamed UI parts + metadata |
| 15 | Client `onFinish` persists the assistant msg | `rag-chatbot.tsx:79-86` → `use-chat-persistence.ts:66` | DB row + URL sync |

**Server page** (`chat/[[...sessionId]]/page.tsx`) loads `initialMessages` for an existing session before render (`:48-56`); the catch-all rejects deeper paths (`:33`).

## C. Key decisions & WHY
- **`stopWhen: stepCountIs(2)`** (`route.ts:86`) — caps a turn at ≤2 model generations. The only tool is provider-executed `googleSearch` grounding, so it usually resolves in 1. *Rationale-from-docs:* `PRE_DEPLOY_AUDIT.md:225` (cost ceiling; "up to 5 completions" was a removed mistake).
- **`maxRetries:0`** (`route.ts:85`) — no silent retry; a provider failure surfaces (mirrors the no-fallback stance, Flow 4).
- **`sendReasoning:false`** (`route.ts:117`) — belt; the braces is `thinkingBudget:0` in `providers.ts:76`. Keeps Gemini's thinking block off the wire.
- **Progressive metadata** (`route.ts:118-167`) — panel mounts on `part.type==="start"` with RAG sources known upfront; grounding queries/sources accumulate and re-emit a full snapshot each part; client deep-merges (arrays replace), so re-sending the whole object is idempotent (`route.ts:96-100` comment).
- **Persist user msg before AI, assistant msg in `onFinish`** (`rag-chatbot.tsx:131`, `:79`) — matches the project rule "save in `onFinish`, not on chunk". URL is synced via `history.replaceState` *after* streaming, not navigation, so the stream isn't wiped (`use-chat-persistence.ts:78-83`).

## D. Data shapes
- `ChatUIMessage = UIMessage<ChatMessageMetadata, UIDataTypes>` — `chat.d.ts:55`.
- `ChatMessageMetadata` — `chat.d.ts:3`: `provider`, `truncated`, `finishReason`, `usage{input/output/total/reasoning}`, `grounding{queries[],sources[]}`, `rag{sources}`.
- Progressive emits (`route.ts`): `start`→`{provider, rag?}` · `source`→`{provider, grounding}` · `finish-step`→`{provider, grounding}` · `finish`→`{provider, truncated, finishReason, usage, grounding}`.
- DB: `chat_messages.parts` + `metadata` store the AI-SDK shapes verbatim → reload re-hydrates the panel.

## E. Rebuild-from-blank (mechanism only)
1. Route Handler `POST /api/chat` that reads `{ messages }`.
2. `streamText({ model, system, messages: convertToModelMessages(messages) })`.
3. `return result.toUIMessageStreamResponse()`.
4. Client: `useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) })`, render `messages[].parts`, call `sendMessage({ text })`.
5. Add `messageMetadata` callback that returns an object per stream part; render it.
6. Add `onFinish` → persist assistant message; persist user message at send time.

## F. Active-recall exercise (~30 min)
Close every file. From memory, write the `POST` handler `route.ts` down to `toUIMessageStreamResponse`, including: the guard call, the order of normalize→memory→RAG→convert→log, and the 4 `messageMetadata` branches. Diff against `route.ts`. Score yourself on: did you put `logChatRequest` *before* `streamText`? did you emit RAG sources on `start` only?

## G. Pitfalls
- **Persisting on stream chunk instead of `onFinish`** double-writes; the code uses `onFinish` (`rag-chatbot.tsx:79`).
- **Navigating to the new session URL** instead of `history.replaceState` remounts `useChat` (key change) and wipes the just-streamed messages (`use-chat-persistence.ts:78` comment).
- **Re-introducing model-facing similarity scores** — see Flow 2 (the model must not see retrieval scaffolding).
- **Body-size: two layers in Next 16** — uploads go through Server Actions capped at `bodySizeLimit:"50mb"` (`next.config.ts:11`); the proxy layer has its own knob `proxyClientMaxBodySize:"50mb"` (`next.config.ts:12`). Chat is a Route Handler — the Server-Action limit does *not* apply to it. Don't assume one number covers both paths.
- **`NEXT_PUBLIC_*` is inlined at build** — changing Supabase URL/key needs a redeploy, not just an env edit.
