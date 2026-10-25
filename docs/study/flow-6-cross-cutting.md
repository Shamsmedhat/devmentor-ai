# Flow 6 — Cross-cutting (rate-limit · memory · i18n/RTL)

> Day 6. The concerns that touch every turn but belong to no single flow.

## A. Purpose
Keep cost bounded (rate limit), keep the prompt small (memory), and serve two languages with direction (i18n/RTL).

## B. The trace
**Rate limit** (`rate-limit.ts`)
| # | Hop | File:line |
|---|---|---|
| 1 | `checkChatRateLimit(userId)` — count rows in `chat_request_log` over last hour (admin client) | `:15-29` |
| 2 | count error → **fail-closed** `{ok:false, reason:"check_failed"}` | `:32-34` |
| 3 | `count >= CHAT_REQUESTS_PER_HOUR` (30) → `over_limit` | `:38` |
| 4 | `logChatRequest(userId, ip)` — best-effort insert, never throws | `:51-64` |

**Memory** (`memory.ts`)
| # | Hop | File:line |
|---|---|---|
| 1 | `memoryStrategy = slidingWindowWithAnchor()` (active) | `:39` |
| 2 | keep `messages[0]` + last `limit-1` (`SLIDING_WINDOW_MESSAGES=10`) | `:26-33`, `ai.constant.ts:19` |
| 3 | pure, generic over `UIMessage` subtype, no mutation | `:5-10` |

**i18n / RTL**
| # | Hop | File:line |
|---|---|---|
| 1 | `routing` — `locales:["ar","en"]`, `defaultLocale:"en"`, `localePrefix:"always"` | `i18n/routing.ts` |
| 2 | `request.ts` loads `messages/{locale}.json` | `i18n/request.ts` |
| 3 | `<html dir>` **derived** from locale | `[locale]/layout.tsx:80` |
| 4 | **chat reply direction = manual toggle** `isArabicResponse` | `chat-ui.context.tsx:31`, `chat-header.tsx:56`, `rag-chatbot.tsx:148` |

## C. Key decisions & WHY
- **Per-user, not per-IP** (`rate-limit.ts:13` comment) — counts real `/api/chat` requests in a server-only table; can't be bypassed by skipping message-save. *Rationale-from-docs:* `PRE_DEPLOY_AUDIT.md:76` — a per-IP cap would lock out co-located students behind shared IPs / CGNAT (bootcamp WiFi, Egyptian mobile). Multi-account abuse is bounded by the Google spend cap, not an app throttle.
- **Fail-closed on the *check*, fail-open on the *log*** (`:32` vs `:51-64`) — a count error denies (cost safety); a logging error must not block chat (the count gate is the real limiter).
- **Anchor + sliding window** (`memory.ts:26`) — `messages[0]` often sets project context (stack/task), so it's always preserved while the tail slides. RAG reads the latest message, which the strategy always keeps, so it's safe to run on `trimmed` (`route.ts:66-67`).
- **Swap-by-one-line** — `memoryStrategy` (`memory.ts:39`) and `ACTIVE_CHAT_PROVIDER_ID` (Flow 4) follow the same "one constant, no call-site edits" pattern.
- **RTL is split, stated plainly:** page/`<html>` direction is *derived* from the URL locale (`layout.tsx:80`), but the **chat response direction is a manual button**, defaulting `false`, never auto-detected from message language (`chat-header.tsx:56`). Reset on New Chat (`chat-ui.context.tsx:41`). This is messier than "RTL derived everywhere" — it's a deliberate per-conversation toggle.
- **ar/en key parity** — both message files carry the same keys (229 each at audit time); add keys to both, never rephrase existing ones (CLAUDE.md).

## D. Data shapes
- `chat_request_log { id, user_id, ip, created_at }`, indexed `(user_id, created_at)` & `(ip, created_at)`, RLS on / no policies — *rationale-from-docs*, `PROJECT_DEEP_DIVE.md:1113`.
- `MemoryStrategy = <M extends UIMessage>(messages: M[]) => M[]` — `memory.ts:10`.
- `ChatUiContextValue` carries `isArabicResponse`, `setIsArabicResponse`, `currentTitle`, `chatInstanceKey`, `startNewChat` — `chat-ui.context.tsx:14-21`.
- Insights panel reads `ChatMessageMetadata` (Flow 1 §D); sidebar stays live via `useChatSessionsRealtime` (`use-chat-sessions-realtime.ts:8`, refetch-on-change).

## E. Rebuild-from-blank (mechanism only)
1. A server-only `request_log` table; count rows in a window before serving; log after.
2. Fail-closed on the count, fail-open on the insert.
3. A pure `trim(messages)` function (anchor + last N); call it before building the prompt.
4. next-intl `routing` + `request` + locale-prefixed routes; derive `<html dir>` from locale.
5. A context value for any per-conversation UI toggle (e.g. reply direction).

## F. Active-recall exercise (~30 min)
Close the files. Write `checkChatRateLimit` + `logChatRequest` from memory — get the fail-closed/fail-open asymmetry right. Then write `slidingWindowWithAnchor`. Then state, in one line each, where `<html dir>` comes from vs where the chat reply direction comes from. Diff against `rate-limit.ts`, `memory.ts`, `layout.tsx:80`, `chat-header.tsx:56`.

## G. Pitfalls
- **Per-IP limiting** locks out CGNAT/shared-IP cohorts — per-user is deliberate.
- **Counting persisted messages instead of requests** is bypassable (skip the save) — count requests in a dedicated table.
- **Fail-open on the check** burns budget on a DB blip — the *check* fails closed.
- **Assuming RTL is automatic for replies** — it's a manual toggle; an Arabic answer in an LTR-defaulted conversation renders LTR until the user flips it.
- **Adding a string to only `en.json`** breaks `ar` at runtime — keep parity.
