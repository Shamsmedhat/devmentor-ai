# DevMentor AI — Pre-Deploy Audit

**Date:** 2026-06-05 (updated after owner-gate fix)
**Scope:** Read-only audit ahead of Vercel + Supabase deploy on a **paid** Google API key.
**Method:** Static inspection + `yarn tsc --noEmit` + `yarn lint`. Every claim cites `file:line`. Unverifiable items marked **UNVERIFIED**.
**Verdict:** 🔴 **FIX-FIRST — do not deploy as-is.** (§3 admin-gating is now RESOLVED; remaining cost-control blockers stand — see §7.)

---

## 1. Model & Provider Identity

| Thing | Value | Evidence |
| --- | --- | --- |
| `ACTIVE_CHAT_PROVIDER_ID` | `"google:gemini-2.5-flash"` | `src/lib/ai/providers.ts:112` |
| Resolved chat model (literal to Google) | `"gemini-2.5-flash"` via `google.chat("gemini-2.5-flash")` | `src/lib/ai/providers.ts:106` |
| Chat API-key env | `GOOGLE_GENERATIVE_AI_API_KEY` | `src/lib/ai/providers.ts:104`; checked at `src/app/api/chat/route.ts:41` |
| Embedding model | `"gemini-embedding-001"` | `src/lib/ai/embeddings.ts:19` (query), `:45` (batch) |
| Embedding dimensions | `768` via `EMBEDDING_DIMENSIONS` | `src/lib/ai/embeddings.ts:13` |
| `outputDimensionality` set | `providerOptions.google.outputDimensionality` | `src/lib/ai/embeddings.ts:21-23` (query), `:47-49` (batch) |
| Embedding API-key env | `GOOGLE_GENERATIVE_AI_API_KEY` (default of `@ai-sdk/google`; no explicit key passed) | `src/lib/ai/embeddings.ts:9` |

**Chat key == embedding key?** ✅ Yes — both use `GOOGLE_GENERATIVE_AI_API_KEY`. Both bill the paid key.

**Committed provider correct?** ✅ Yes. Active provider is **Google Gemini 2.5 Flash** — the intended production choice, **not** a dev value (groq). The two groq entries in `CHAT_PROVIDERS` (`providers.ts:86-101`) are inactive catalog entries.

⚠️ **Third key, undocumented:** the Google Search grounding tool reads a **different** env var `GOOGLE_API_KEY` with a non-null assertion — `process.env.GOOGLE_API_KEY!` (`src/lib/ai/providers.ts:41`). It is **not** in `.env.example`. If grounding fires and the var is unset, you pass `undefined` into the tool. See §2.

---

## 2. Cost-Exposure Audit (paid key) — most important

### One chat turn, traced end-to-end

`POST /api/chat` (`route.ts:19`)
→ `guardChatRoute()` (`route.ts:21`) = auth + rate-limit (1 Supabase count query, no AI)
→ `memoryStrategy(normalized)` (`route.ts:56`) = pure, no API (`memory.ts:39`)
→ `buildRagSystemPrompt(trimmed)` (`route.ts:60` → `rag.ts:18`)
→ `searchKnowledgeBase(...)` (`rag.ts:26` → `search.ts:12`)
→ `generateEmbeddings(query)` (`search.ts:27` → `embeddings.ts:18`) = **1 embed call**
→ 1 Supabase `rpc("search_knowledge_base")` (`search.ts:29`)
→ `streamText({...})` (`route.ts:64`)

### Max paid calls per turn

| Resource | Count | Verdict | Evidence |
| --- | --- | --- | --- |
| Embedding calls | **exactly 1** | ✅ | Only one `embed()` reachable from chat; `embedMany` is ingestion-only. All model-call sites: `embeddings.ts:18,44`, `route.ts:64`. |
| KB vector searches | **exactly 1** | ✅ | `search.ts:29` |
| Completion calls | **up to 5** | 🔴 | `stopWhen: stepCountIs(5)` (`route.ts:71`) permits 5 model steps; chat enables tools (`route.ts:65` → `googleSearchTools`, `providers.ts:106-107`). Each step = a billable `generateContent`. **Not** "exactly one completion per message." |
| Retries | 0 | ✅ | `maxRetries: 0` (`route.ts:70`) — no retry amplification. |
| Google Search grounding | up to 5× per turn | 🔴 | Active provider attaches `google.tools.googleSearch` (`providers.ts:38-43,106-107`). Grounding is **billed separately** from tokens on the paid tier. |

> 🔴 **The "exactly one embedding + one completion, eager-only RAG, no tool fan-out" assumption is FALSE for the active provider.** Embedding is 1, but the completion path is a tool-enabled multi-step loop (up to 5 steps) with separately-billed Google Search grounding. For true eager-only/one-completion behavior, set `stopWhen` to `stepCountIs(1)` and/or give the active provider `emptyTools` (`providers.ts:45`).

### Output / input / context guards

| Guard | Present? | File:line | Notes |
| --- | --- | --- | --- |
| Max output tokens | ✅ | `route.ts:69` applies `AI_LIMITS.CHAT_MAX_TOKENS` (`ai.constant.ts:2` = **3000**) as `maxOutputTokens` | Bounded **per step**; with `stepCountIs(5)` effective output ~5×3000. Value is 3× the 1000 in `03-ai.mdc`. |
| Input sliding window | ✅ | `route.ts:56` `memoryStrategy` = `slidingWindowWithAnchor()` (`memory.ts:39`), `SLIDING_WINDOW_MESSAGES=10` (`ai.constant.ts:18`); trimmed **before** prompt build + `convertToModelMessages` | Anchor (msg[0]) + last 9. |
| RAG result cap | ✅ | `RAG_MAX_RESULTS=10` (`ai.constant.ts:8`) passed at `rag.ts:28`; clamped `≤50` in `search.ts:23` | Threshold 0.6 (`ai.constant.ts:6`). |

### Rate limiting — PRESENT but **BYPASSABLE** 🔴

- **Present:** `checkChatRateLimit(user.id)` via `guardChatRoute` (`route-guard.util.ts:41`, called at `route.ts:21`). Per-user, DB counter on `chat_messages` over the last hour, `CHAT_MESSAGES_PER_HOUR=50` (`rate-limit.ts:9-37`, `ai.constant.ts:13`). Fails **closed** on count error → 503 (`rate-limit.ts:26-29`).
- 🔴 **Bypass:** the limiter counts **rows in `chat_messages`** (`rate-limit.ts:20`). The chat route **never writes** `chat_messages` — persistence is a **separate, client-initiated** server action `saveChatMessageAction` (`chat.action.ts:19-37`). The only writers are `chat.action.ts:28` and `chat.service.ts:23`; the route has no insert. **An authenticated user who calls `POST /api/chat` directly and never calls `saveChatMessageAction` is never counted → unlimited paid completions.**
- ⚠️ Even honest clients: counter lags real requests (concurrent bursts), and counts both user **and** assistant rows, so 50/hr ≈ 25 turns.
- **No per-IP / global / middleware throttle exists.** Beyond the (bypassable) per-user-per-hour check, **one authenticated user can issue effectively unlimited chat turns, each a paid completion (×up to 5) plus grounding.**

### Auth gate

✅ Chat endpoint is auth-gated: `guardChatRoute` → `getServerSupabaseAuth()` → 401 if no user (`route-guard.util.ts:31-38`, `route.ts:21-22`). Uses `getUser()` (not `getSession()`), per rules.

### Guard summary

| Guard | Present? | File | Gap |
| --- | --- | --- | --- |
| Auth | ✅ | `route-guard.util.ts:31`, `route.ts:21` | — |
| Per-user rate limit | ⚠️ present but bypassable | `rate-limit.ts`, `route.ts:21` | counts persisted rows, not requests; direct `/api/chat` calls uncounted |
| Per-IP / global limit | 🔴 ABSENT | — | none anywhere |
| Max output tokens | ✅ | `route.ts:69` | ×steps; 3000 |
| Input window | ✅ | `route.ts:56` | — |
| RAG result cap | ✅ | `rag.ts:28`, `search.ts:23` | — |
| Max retries | ✅ (0) | `route.ts:70` | — |
| Completions per turn = 1 | 🔴 | `route.ts:71` | `stepCountIs(5)` → up to 5 |
| Search-grounding cost | 🔴 no guard | `providers.ts:106-107` | billed per grounded turn |

---

## 3. Admin Route Protection — ✅ RESOLVED (fix applied 2026-06-05)

**Status:** the gaps below were fixed in a 5-file surgical change. Original findings retained for the record, each annotated with its fix.

**How it's done now:** single-owner **email allowlist** via `process.env.OWNER_EMAIL`, enforced by a shared helper and applied to **both** the page (middleware) and **each ingestion action** (server-side). Fails **closed**: if `OWNER_EMAIL` is unset, nobody is the owner.

```ts
// src/lib/utils/require-owner.ts (NEW)
export function isOwner(user: User | null): boolean {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return false; // fail closed
  return user?.email === ownerEmail;
}
```

### ✅ Fix 1 — page guard locale-prefix bypass (was 🔴)

**Original bug:** `proxy.ts` tested literal `pathname === "/upload"` while `localePrefix: "always"` (`i18n/routing.ts`) makes routes `/en/upload`, `/ar/upload`; the check never fired, and `"upload"` was absent from `PROTECTED_ROUTES`, so the page rendered for anyone.

**Fix:** the literal block was removed and replaced with a locale-stripped check that runs after `root` is derived (same mechanism as `PROTECTED_ROUTES`), with a locale-aware redirect:

```ts
// src/proxy.ts
if (root === "upload" && !isOwner(user)) {
  return NextResponse.redirect(new URL(`/${locale}/chat`, request.url));
}
```

### ✅ Fix 2 — Server Actions not admin-gated (was 🔴, the real exposure)

**Original bug:** all three ingestion actions checked **auth only** (`if (!user)`), not owner — any logged-in student could invoke them directly (server actions are public POST endpoints) and trigger paid Firecrawl/AssemblyAI/Gemini work plus `createAdminClient()` writes/deletes that **bypass RLS**.

**Fix:** an owner check was added at the top of each action, immediately after the existing auth check, returning each action's existing `{ success: false, error }` contract (error: `"Forbidden"`):

| Action | Auth check | Owner check (added) |
| --- | --- | --- |
| `ingestUrlsAction` | `ingest-url.action.ts:28-31` | ✅ `ingest-url.action.ts:33-36` (`if (!isOwner(user))`) |
| `processPdfFileAction` | `documents.action.ts:13-20` | ✅ `documents.action.ts:22-27` (inside existing try) |
| `ingestVideoAction` | `ingest-video.action.ts:22-25` | ✅ `ingest-video.action.ts:27-30` |

*(Line numbers post-edit; the check is defined once in `require-owner.ts` and reused — no duplication.)*

**Verdict (now):** the upload surface is **admin-only end-to-end**. The page redirects non-owners on the real locale-prefixed URLs, and the RLS-bypassing ingestion actions independently return `Forbidden` even if called directly — closing the exposure regardless of the page.

**Files changed:** `src/lib/utils/require-owner.ts` (new), `ingest-url.action.ts`, `documents.action.ts`, `ingest-video.action.ts`, `src/proxy.ts`. `tsc --noEmit` clean after the change.

> ⚠️ **Operational requirement (fail-closed):** `OWNER_EMAIL` MUST be set in **`.env.local`** (local) **and** **Vercel** env (Production, and Preview if used), matching the exact email on the owner's Supabase-authenticated Google account. If unset, *everyone* — including the owner — is locked out of upload/ingestion. `.env.example` already carries the `OWNER_EMAIL=` placeholder.

---

## 4. Chat Provider Constant

- `ACTIVE_CHAT_PROVIDER_ID = "google:gemini-2.5-flash"` (`providers.ts:112`) — ✅ intended production provider, not a dev value.
- Its `apiKeyEnv = "GOOGLE_GENERATIVE_AI_API_KEY"` (`providers.ts:104`) matches `.env.example` and is what you'll set in Vercel. ✅
- 🟡 **Dead config:** `.env.example` defines `CHAT_MODEL_PROVIDER=` but nothing reads it — the active provider is the hardcoded constant in `providers.ts`. Setting `CHAT_MODEL_PROVIDER` in Vercel has **no effect** (misleading). Switching providers in prod requires a code edit + redeploy. Same for `OPENROUTER_API_KEY` and `AGENT_ROUTER_API_KEY/BASE_URL` in `.env.example` — unused in `src`.

---

## 5. Dead Code / Unused / Duplicate

### Unused dependencies (grep = 0 across `src`, `scripts`, root configs)

| Package | Status | Recommendation |
| --- | --- | --- |
| `@google/genai` (2.4.0) | unused in `src` (only the two test scripts import it) | safe to remove in a cleanup PR |
| `@xyflow/react` | 0 imports | likely unused — verify, then remove |
| `react-jsx-parser` | 0 imports | likely unused — verify, then remove |
| `ansi-to-react` | 0 imports | likely unused — verify, then remove |
| `tokenlens` | 0 imports | likely unused — verify, then remove |
| `media-chrome` | 0 imports | likely unused — verify, then remove |
| `@rive-app/react-webgl2` | 0 imports | likely unused — verify, then remove |
| `@types/react-syntax-highlighter` (devDep) | 0 imports; no `react-syntax-highlighter` runtime dep | orphan types pkg — safe to remove |

> `@langchain/core` — **kept on purpose**: required transitive runtime peer of `@langchain/textsplitters` (used by `chunking.ts`). **Do not remove.**
> Confirmed *used* (don't touch): `streamdown`(5), `shiki`(2), `@streamdown/*`(2 each), `motion`(3), `embla-carousel-react`(1, via `ui/carousel`), `cmdk`(1), `nanoid`(4), `use-stick-to-bottom`(1), all `components/ai-elements/*` (6 importers).

### Duplicate / orphan files

- 🟡 **`test-genai-rpd.mjs` exists twice** — repo root **and** `src/lib/utils/test-genai-rpd.mjs` (same mtime, same purpose). The `src/lib/utils` copy references the **stale** model `"text-embedding-004"` (`src/lib/utils/test-genai-rpd.mjs:6`), which disagrees with production `gemini-embedding-001` (`embeddings.ts:19`). Delete both (dev-only scratch) or consolidate to one and fix the model name. *(Cleanup PR.)*

### Duplicate / conflicting implementations — none harmful

- `generateEmbeddings` (single, query) vs `generateEmbeddingsMany` (batch, ingestion) — distinct roles. Keep.
- `chunking.ts:chunkText` (text/PDF/URL) vs `video-chunker.ts:chunkTranscriptWithTimestamps` (timestamp-aware) — distinct. Keep.
- `memory.ts` ships two strategies; only `slidingWindowWithAnchor` is active (`memory.ts:39`). `slidingWindow` is an intentional swap option. Keep.
- `CHAT_PROVIDERS` has 3 entries, 2 inactive (groq) — intentional catalog. Keep.

### Lint-smell greps

| Check | Count | Notes |
| --- | --- | --- |
| `any` (excl. `components/ui`) | **0** real | the one match (`prompts.ts:315`) is the English word "any" in a prompt string. ✅ |
| `console.log` | **0** | ✅ |
| `console.warn/info/debug` | **0** | only `console.error` in catch blocks (allowed). ✅ |
| commented-out code | **0** real | the two `// return ...`-style lines (`proxy.ts`, `safe-next-path.ts:52`) are section labels. ✅ |

---

## 6. Code Health Numbers

- **`yarn tsc --noEmit`:** ✅ **0 errors** (exit 0) — re-confirmed after the §3 fix.
- **`yarn lint`:** **1 error, 0 warnings.**
  - `src/components/ui/carousel.tsx:98` — `react-hooks/set-state-in-effect`.
  - **Vendor shadcn code** (`components/ui/*`) — not to be touched per CLAUDE.md.
  - **Build impact — UNVERIFIED:** `next.config.ts` does not set `eslint.ignoreDuringBuilds`. In Next 16, ESLint is no longer run automatically during `next build`, so the Vercel build **likely will not fail** — not confirmed via `yarn build`. ⚠️ If CI runs `yarn lint` as its own gate, it will fail. Mitigation: scoped `eslint-disable` or a `components/ui/**` override in `eslint.config.mjs` (mirroring the `ai-elements` override).

---

## 7. Deploy-Blocker Summary

### 🔴 Must fix before deploy
1. **Chat rate limit is bypassable** — counts `chat_messages` rows (`rate-limit.ts:20`) but the route never writes them (persistence is the separate client action `chat.action.ts:19`). Direct `/api/chat` calls are uncounted → unlimited paid completions. **Fix:** rate-limit on requests (in-route counter / Upstash / request-log table), not persisted messages.
2. **Completions not capped at 1 + paid Google Search grounding** — `stepCountIs(5)` (`route.ts:71`) + `googleSearch` tool on the active provider (`providers.ts:106-107`) → up to 5 billable completions plus separately-billed grounding per turn. **Fix:** `stopWhen: stepCountIs(1)` and/or `emptyTools` for the active provider if you want eager-only RAG; add the missing `GOOGLE_API_KEY` env (`providers.ts:41`) or you'll pass `undefined` if grounding fires.
3. **No per-IP / global rate limit anywhere** — only the (bypassable) per-user-per-hour DB check. **One authenticated user can issue unlimited chat turns, each a paid completion.** **Fix:** Upstash/middleware throttle keyed on user **and** IP at the route.

### ✅ Fixed (was 🔴)
- **Ingestion Server Actions + `/upload` page now owner-gated** end-to-end via `isOwner` (`require-owner.ts`), applied in all three actions and `proxy.ts`. See §3. **Remaining action:** set `OWNER_EMAIL` in `.env.local` **and** Vercel (fail-closed).

### 🟡 Soon
- `CHAT_MAX_TOKENS=3000` × up to 5 steps = larger output cost than the rule's 1000 (`ai.constant.ts:2`). Reconsider once §7.2 is fixed.
- Dead env vars in `.env.example` (`CHAT_MODEL_PROVIDER`, `OPENROUTER_API_KEY`, `AGENT_ROUTER_API_KEY/BASE_URL`).
- Vendor lint error in `components/ui/carousel.tsx:98` — confirm it doesn't fail the Vercel/CI lint gate (§6).

### 🟢 Nice-to-have (cleanup PR)
- Remove `@google/genai` and the duplicated `test-genai-rpd.mjs` (root + `src/lib/utils`); the `src/lib/utils` copy uses the stale model `text-embedding-004`.
- Remove unused deps: `@xyflow/react`, `react-jsx-parser`, `ansi-to-react`, `tokenlens`, `media-chrome`, `@rive-app/react-webgl2`, `@types/react-syntax-highlighter` (verify each first).

---

*Read-only audit, with the §3 admin-gating fix subsequently applied (5 files). No DB objects or `components/ui/*` were modified.*
