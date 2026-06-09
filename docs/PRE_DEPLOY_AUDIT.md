# DevMentor AI — Pre-Deploy Audit

**Date:** 2026-06-06 (updated after owner-gate, rate-limit, and grounding/throttle decisions)
**Scope:** Read-only audit ahead of Vercel + Supabase deploy on a **paid** Google API key.
**Method:** Static inspection + `yarn tsc --noEmit` + `yarn lint`. Every claim cites `file:line`. Unverifiable items marked **UNVERIFIED**.
**Verdict:** ✅ **Ready to deploy — all audit blockers resolved or accepted.** Admin-gating (§3) and the rate-limit bypass (§2) were fixed; the completions/grounding and per-IP-throttle items were reviewed and **accepted as deliberate design** (§2, §7), not blockers.

**Operational prerequisites before / at deploy:**
1. Run the `chat_request_log` `CREATE TABLE` in Supabase (SQL in §7) — fail-closed: absent table → 503 on every chat request.
2. Set `OWNER_EMAIL` in **`.env.local`** and **Vercel** (fail-closed: unset → upload/ingestion locked for everyone).
3. Set a **Google Project Spend Cap (~DKK 700)** + budget alerts — this is the real cost ceiling backstopping the per-user limit and grounding usage.

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

✅ **RESOLVED — "third key" was a false alarm and is gone.** The earlier draft flagged a separate `GOOGLE_API_KEY` passed into the grounding tool. That was wrong: `google.tools.googleSearch()` does **not** accept an `apiKey` field — passing one returns a 400 (`Unknown name "apiKey" at tools[0].google_search`). The `apiKey` was removed; the call is now `google.tools.googleSearch({})` (`src/lib/ai/providers.ts:40`). Grounding authenticates via the provider's `GOOGLE_GENERATIVE_AI_API_KEY` — there is **no `GOOGLE_API_KEY` anywhere** in the codebase. No env var to add.

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
| Completion calls | **≤ 2 (proven ceiling); ≈ 1 expected** | ✅ | **Proven:** `stopWhen: stepCountIs(2)` (`route.ts:85`) caps the turn at **≤ 2 model generations** — hard upper bound. **Expected:** the active provider's only tool is the **provider-executed** `googleSearch` grounding (no client/function tools), which typically resolves server-side within a **single generation** → ≈ 1 in practice (not runtime-traced). The earlier "up to 5" was wrong. |
| Retries | 0 | ✅ | `maxRetries: 0` (`route.ts:84`) — no retry amplification. |
| Google Search grounding | kept deliberately | ✅ accepted | Active provider attaches `google.tools.googleSearch({})` (`providers.ts:38-43,105`) as the **out-of-KB answer path**. On Gemini 2.5 Flash, grounding is **free under 1,500 queries/day** (paid tier), then $35/1k — effectively free at our scale; the Google Project Spend Cap is the backstop. |

> ✅ **Accepted design.** Embedding is exactly 1. Completions are **capped at ≤ 2 model generations per turn** by `stepCountIs(2)` (`route.ts:85`) — this is the proven ceiling. In practice it's **expected to be ≈ 1**: the only tool is provider-executed grounding (no client-tool fan-out), which typically resolves within a single generation — though this hasn't been runtime-traced. Grounding is an intentional feature (answers outside the KB), free at our volume and capped by the Google Project Spend Cap. No change required.

### Output / input / context guards

| Guard | Present? | File:line | Notes |
| --- | --- | --- | --- |
| Max output tokens | ✅ | `route.ts:69` applies `AI_LIMITS.CHAT_MAX_TOKENS` (`ai.constant.ts:2` = **3000**) as `maxOutputTokens` | Bounded per step; `stepCountIs(2)` ceiling → ≤2× in the worst case, ≈1× in practice. Value is 3× the 1000 in `03-ai.mdc`. |
| Input sliding window | ✅ | `route.ts:56` `memoryStrategy` = `slidingWindowWithAnchor()` (`memory.ts:39`), `SLIDING_WINDOW_MESSAGES=10` (`ai.constant.ts:18`); trimmed **before** prompt build + `convertToModelMessages` | Anchor (msg[0]) + last 9. |
| RAG result cap | ✅ | `RAG_MAX_RESULTS=10` (`ai.constant.ts:8`) passed at `rag.ts:28`; clamped `≤50` in `search.ts:23` | Threshold 0.6 (`ai.constant.ts:6`). |

### Rate limiting — ✅ bypass RESOLVED (fix applied 2026-06-06); per-user-only by design

- **Now counts ACTUAL requests, per user.** `checkChatRateLimit(user.id)` (via `guardChatRoute`, `route.ts:21`) counts rows in a dedicated server-only **`chat_request_log`** table over the last hour, using the **admin** (service-role) client, `CHAT_REQUESTS_PER_HOUR=30` (`rate-limit.ts:14-46`, `ai.constant.ts:13-14`). Fails **closed** on count error → 503.
- **Every `/api/chat` hit is logged** before `streamText` via best-effort `logChatRequest(guard.user.id, getClientIp(request))` (`route.ts`, `rate-limit.ts:53-66`). The insert is best-effort (logs `console.error` and continues on failure — the count gate is the limiter), and one row = one request = one turn.
- ✅ **Bypass closed:** the limiter no longer depends on the client calling `saveChatMessageAction`. Calling `POST /api/chat` directly is now counted regardless of whether the message is later persisted. The original bug (counting `chat_messages`, which the route never writes) is gone.
- Enforcement is **per-user only** (intentional). IP is recorded in `chat_request_log.ip` for auditing but **not** capped.
- ⚠️ **Operational dependency:** requires the `chat_request_log` table (RLS on, no policies — service-role only). Until it exists, the fail-closed count errors → 503 on every request. SQL is owner-run in Supabase (see §7).
- ✅ **No per-IP / global throttle — deliberate decision (accepted).** Per-user-only is intentional: a per-IP cap would lock out **co-located students sharing one public IP** (bootcamp WiFi, shared home networks, Egyptian mobile **CGNAT**). Multi-account / distributed abuse is bounded by the **Google Project Spend Cap**, not an app-layer IP throttle. IP is still logged in `chat_request_log.ip` for forensics. Each allowed turn is ≈1 paid completion (see §2) plus free-at-scale grounding.

### Auth gate

✅ Chat endpoint is auth-gated: `guardChatRoute` → `getServerSupabaseAuth()` → 401 if no user (`route-guard.util.ts:31-38`, `route.ts:21-22`). Uses `getUser()` (not `getSession()`), per rules.

### Guard summary

| Guard | Present? | File | Gap |
| --- | --- | --- | --- |
| Auth | ✅ | `route-guard.util.ts:31`, `route.ts:21` | — |
| Per-user rate limit | ✅ fixed | `rate-limit.ts`, `route.ts:21` | counts real requests in `chat_request_log` (30/hr); bypass closed |
| Per-IP / global limit | ✅ accepted (omitted by design) | — | per-user-only to avoid CGNAT/shared-IP lockout; cost bounded by Google Spend Cap; IP logged for forensics |
| Max output tokens | ✅ | `route.ts:69` | 3000; bounded per turn (`stepCountIs(2)` ceiling) |
| Input window | ✅ | `route.ts:56` | — |
| RAG result cap | ✅ | `rag.ts:28`, `search.ts:23` | — |
| Max retries | ✅ (0) | `route.ts:84` | — |
| Completions per turn | ✅ | `route.ts:85` | `stepCountIs(2)` caps at **≤ 2** generations (proven); ≈ 1 expected (provider-executed grounding, not runtime-traced) |
| Search-grounding cost | ✅ accepted | `providers.ts:40,105` | kept deliberately; free <1,500/day on Flash; Spend Cap backstop |

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
- **None.** All original 🔴 items are either fixed or accepted as deliberate design (below).

### ⚙️ Operational prerequisites (do at deploy — not code blockers)
1. **Run the `chat_request_log` `CREATE TABLE`** in Supabase (SQL below). Fail-closed: absent table → 503 on every chat request.
2. **Set `OWNER_EMAIL`** in `.env.local` **and** Vercel. Fail-closed: unset → upload/ingestion locked for everyone (including the owner).
3. **Set a Google Project Spend Cap (~DKK 700)** + budget alerts. This is the real cost ceiling backstopping the per-user rate limit and grounding usage.

### ✅ Fixed (was 🔴)
- **Chat rate limit bypass closed** (2026-06-06) — `checkChatRateLimit` counts **actual requests** in `chat_request_log` (admin client, `CHAT_REQUESTS_PER_HOUR=30`); every `/api/chat` hit is logged before `streamText` via best-effort `logChatRequest`. No longer depends on `saveChatMessageAction`. See §2.
- **Ingestion Server Actions + `/upload` page owner-gated** end-to-end via `isOwner` (`require-owner.ts`), in all three actions and `proxy.ts`. See §3.

### ✅ Accepted design (reviewed — not blockers)
- **Completions capped at ≤ 2/turn (≈ 1 expected) + Google Search grounding kept** — `stopWhen: stepCountIs(2)` (`route.ts:85`) caps the turn at **≤ 2 model generations** (proven ceiling). In practice it's **expected to be ≈ 1**: the only tool is provider-executed `googleSearch` grounding (no client/function tools), which typically resolves within a **single generation** — not runtime-traced. Grounding is the deliberate out-of-KB answer path, **free under 1,500 queries/day** on Gemini 2.5 Flash, then $35/1k — bounded by the Spend Cap. The earlier "up to 5 completions" and the "add `GOOGLE_API_KEY`" recommendation were both **wrong and have been removed** (see §1 / §2).
- **No per-IP / global throttle (per-user-only)** — deliberate, to avoid locking out co-located students behind shared public IPs / CGNAT (bootcamp WiFi, Egyptian mobile). Multi-account/distributed abuse is bounded by the Google Project Spend Cap; IP is logged for forensics. See §2.

> **Owner-run SQL prerequisite (rate-limit fix):**
> ```sql
> create table if not exists public.chat_request_log (
>   id         uuid        primary key default gen_random_uuid(),
>   user_id    uuid,
>   ip         text,
>   created_at timestamptz not null default now()
> );
> create index if not exists chat_request_log_user_created_idx
>   on public.chat_request_log (user_id, created_at);
> create index if not exists chat_request_log_ip_created_idx
>   on public.chat_request_log (ip, created_at);
> alter table public.chat_request_log enable row level security;
> ```

### 🟡 Soon
- `CHAT_MAX_TOKENS=3000` (`ai.constant.ts:2`) is 3× the rule's 1000. With `stepCountIs(2)` and ≈1 generation/turn, output is bounded per turn (≤2× worst case, ≈1× typical) — minor cost note, no longer a multiplier concern.
- Dead env vars in `.env.example` (`CHAT_MODEL_PROVIDER`, `OPENROUTER_API_KEY`, `AGENT_ROUTER_API_KEY/BASE_URL`).
- Vendor lint error in `components/ui/carousel.tsx:98` — confirm it doesn't fail the Vercel/CI lint gate (§6).

### 🟢 Nice-to-have (cleanup PR)
- Remove `@google/genai` and the duplicated `test-genai-rpd.mjs` (root + `src/lib/utils`); the `src/lib/utils` copy uses the stale model `text-embedding-004`.
- Remove unused deps: `@xyflow/react`, `react-jsx-parser`, `ansi-to-react`, `tokenlens`, `media-chrome`, `@rive-app/react-webgl2`, `@types/react-syntax-highlighter` (verify each first).

---

*Read-only audit, with the §3 admin-gating fix (5 files, 2026-06-05) and the §2 rate-limit fix (3 files + owner-run SQL, 2026-06-06) subsequently applied, then re-reviewed (2026-06-06): the completions/grounding and per-IP-throttle items were accepted as deliberate design and the verdict flipped to ✅ Ready to deploy. No DB objects or `components/ui/*` were modified by the assistant.*
