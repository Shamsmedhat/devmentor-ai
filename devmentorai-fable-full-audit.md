# DevMentor AI — Full Audit Report (2026-07-07, read-only)

**Overall:** The core is in good shape — the chat route's guard→normalize→memory→RAG→stream pipeline is clean, typed, and deliberate; error handling is mostly consistent; there is essentially zero `any`/`console.log` debt in app code. The problems cluster in four places: the **PDF ingestion path** (frozen at an older standard than URL/video), **trust of client-supplied `messages`**, **stale docs that no longer match the code** (including one documented SQL snippet that would rebuild retrieval broken), and a handful of **silent-failure persistence paths**.

---

## Executive summary — top 5

1. **🔴 The runbook's `search_knowledge_base` SQL is broken as written — verify the live function.** `docs/study/REBUILD-RUNBOOK.md:44-55` names the parameter `embedding`, which collides with the `kb.embedding` column. In `LANGUAGE sql` functions, **the column wins**, so `kb.embedding <=> embedding` computes each row's distance to itself → similarity 1.0 for every row, random top-10 retrieval. Your eval script's control questions suggest the *live* function is probably correct (a broken one would flag `BAD-CONTROL` everywhere), but the doc you'd rebuild from is a landmine. **Verify:** run `select similarity from search_knowledge_base(<any real embedding>, 5, 0)` — if every row returns exactly 1.0, it's live-broken; also `\sf search_knowledge_base` to compare with the doc.
2. **🔴 `/api/chat` fully trusts client-supplied `messages` — size and file parts included.** `route.ts:33-44` only checks "is an array". No cap on message count/length (memory trimming caps *count*, not *bytes* — one 2 MB "message" sails through to the embedder and Gemini), and crafted `file` parts reach `normalizeUiMessagesForAttachmentCapabilities`, whose fallback path does a **server-side `fetch` of an attacker-chosen URL** (`normalize-ui-messages-for-model.ts:65`) — an SSRF/content-exfiltration primitive when a Groq provider is active, and a needs-verification concern on Gemini (the AI SDK may download http(s) file URLs server-side too). Authenticated users only, but that's 80 students.
3. **🟠 PDF ingestion is asymmetric with URL/video — confirmed.** `documents.action.ts` **appends** (no delete-by-`document_id`, unlike `ingest-url.action.ts:76-79` and `ingest-video.action.ts:81-84`), writes **no `source_type`** (`documents.action.ts:67-71`), keys on raw `file.name`, and validates nothing about the file. Re-uploading the same PDF silently duplicates chunks, skewing retrieval toward that document.
4. **🟠 The pre-deploy cost/behavior audit is stale: query rewriting added a third model generation per turn.** `rag.ts:28` → `query-rewrite.ts:39` runs a `generateText` on **every turn after the first**, before streaming starts. `PRE_DEPLOY_AUDIT.md` §2's "exactly 1 embed, ≤2 completions" ceiling is no longer true (it's ≤3 generations + 1 embed), and the rewrite adds a full LLM round-trip to time-to-first-token on every follow-up.
5. **🟠 Sidebar ordering/timestamps depend on `chat_sessions.updated_at`, which nothing appears to bump.** `chat.service.ts:11` and `use-chat-sessions-realtime.ts:26` order by `updated_at`; `sidebar.tsx:174` displays it. But new messages only insert into `chat_messages` (`chat.action.ts:28`) — no code touches the session row after title-set. Unless you have a DB trigger (none is documented in the runbook), "Recent" is actually "recently created" and the relative time is frozen. **Verify:** send a message in an old session and watch whether it jumps to the top.

---

## 1. Correctness & bugs

**🔴 Runbook SQL parameter shadowing** — covered in summary #1. Real bug in the doc; live function needs verification.

**🟠 PDF append + no `source_type` + no validation** — covered in summary #3. Additional details:
- `documents.action.ts:32` — `formData.get("file") as File` with no null check; a missing file throws inside the try and surfaces as a raw runtime message ("Cannot read properties of null…") instead of a clean error.
- `documents.action.ts:55-62` — if `chunkText` returns `[]` (empty-text PDF passes the `data.text` check but could still chunk to nothing), the code proceeds to `generateEmbeddingsMany([])` and `insert([])` with no guard, unlike the URL path (`ingest-url.action.ts:60-67`).
- URL/video/doc-script are symmetric (overwrite-by-`document_id`); PDF is the only divergent path.

**🟠 `document_id` keying is inconsistent across ingestion paths — and documented as such.** `url-normalize.ts:1-25` states it plainly: the UI URL path keys on Firecrawl's resolved `sourceURL` (`ingest-url.action.ts:79,89`), the bulk script keys on the normalized *input* URL (`kb-ingest.ts:148`). Same page via both paths = duplicate chunks under two IDs. You've accepted "pick one path per source," but nothing *enforces* it — no shared-normalization or conflict check. One `normalizeUrl()` call in `ingest-url.action.ts` would close it (with a one-time re-key of existing rows).

**🟠 Video `document_id` = `video_title`** (`ingest-video.action.ts:84,94`) — two different lectures given the same title silently overwrite each other. A typo'd re-upload with a *different* title duplicates instead of replacing. Deliberate simplicity, but it's the only human-typed key in the KB.

**🟠 Fire-and-forget user-message persistence can silently lose data.** `rag-chatbot.tsx:131` fires `persistUserMessage` in the background and only `console.error`s failure. If `createChatSessionAction` or the insert fails, the streaming reply still renders, the user assumes it saved, and the turn (or the whole new session) vanishes on refresh. Same for the assistant message (`rag-chatbot.tsx:83-85`). Recommended: surface a small "not saved — retry" affordance, or at minimum toast on persist failure.

**🟡 URL sync only happens on assistant persist.** `use-chat-persistence.ts:81-83` — `history.replaceState` runs inside `persistAssistantMessage`. If the stream errors before `onFinish`, or `messageHasStreamingAssistantActivity` is false (`rag-chatbot.tsx:82`), a *new* chat stays at `/chat` with an orphaned session row that the user can only find via the sidebar.

**🟡 Rate-limit check-then-log race.** `route-guard.util.ts:42` counts *before* `route.ts:77` logs, so N parallel requests at count 29 all pass. Bounded over-admission (single user, small N) — acceptable, just noting it's ~30+ε, not 30.

**Rate-limit fail-open/fail-closed — verified correct as designed.** Check fails **closed** (`rate-limit.ts:32-35` → 503 at `route-guard.util.ts:61-66`); logging fails **open** (`rate-limit.ts:51-64`, best-effort). That's the right pairing. One consequence to accept knowingly: any Supabase blip turns into "chat down" (503) rather than "chat unmetered."

**Query-rewrite correctness — mostly sound.** Fail-open fallbacks are right (`query-rewrite.ts:29-63`): no text → `""` → skip RAG (`rag.ts:29`); LLM failure/empty → raw message. Two real gaps:
- 🟡 `messages.length <= 1` (`query-rewrite.ts:36`) counts *all* messages, not user turns — correct in practice, but the rewrite result also becomes the *displayed* retrieval basis, and there's no cap on rewriter *input* beyond 6×300 chars — fine.
- 🟡 The rewriter uses `getActiveChatProvider().createModel()` — full Gemini 2.5 Flash for a one-line rewrite. A `gemini-2.5-flash-lite` (or similar) entry would cut latency and cost of the most frequent LLM call in the system.

**Retrieval fallback path — verified correct.** `rag.ts:31-45`: RPC failure → `console.error` + plain mentor prompt, no 500. Matches the documented intent.

**🟡 Memory anchor can produce a broken transcript shape.** `memory.ts:29-32` (`slidingWindowWithAnchor`) yields `[messages[0], ...last 9]` — the anchor (a user message) can be immediately followed by another user message with the assistant reply between them dropped. Most providers tolerate this; Gemini generally does, but it's the kind of thing that breaks subtly when switching providers. Needs a dedup guard (`messages[0]` may also *be* in the tail window — when `length === limit+... ` actually at `length > limit` the tail excludes it; fine — the missing-assistant-turn issue is the real one).

## 2. RAG quality

**🟠 Chunking throws away all document structure.** `chunking.ts:8-12` sets `separators: [" "]` — the recursive splitter degrades to a word-boundary chopper. Markdown headings, paragraphs, and **code fences** (docs sites are full of them) get split mid-block at ~500 chars with 50-char overlap. This is the single highest-leverage RAG-quality fix: use the default separators (`["\n\n", "\n", " ", ""]`) or `RecursiveCharacterTextSplitter.fromLanguage("markdown", …)`, and consider 800–1200 chars. Re-ranking is *not* the first lever here — better chunk boundaries would likely resolve much of what a re-ranker would paper over. Re-ingestion cost is bounded (you have the resume-safe script).

**🟠 No diversity control in the context window.** `rag.ts:96-116` passes all top-10 chunks to the model verbatim; dedupe-by-document happens only for the *panel* (`rag.ts:58-94`). With 50-char overlap and adjacent chunks scoring similarly, a single document can fill all 10 slots with near-duplicates and crowd out a second relevant source. A cheap MMR pass or a per-document cap (e.g., max 3–4 chunks/doc) is where "re-ranking would actually help"; a cross-encoder re-ranker is overkill at this corpus size.

**🟡 Cross-lingual gap is structural, and the rewrite prompt entrenches it.** `prompts.ts:375` orders "Write the query in the SAME LANGUAGE as the latest user message. Do not translate." Your corpus is mixed (EN library docs, AR lecture transcripts, AR/EN rose-app docs). An Arabic question about Next.js caching must cross-lingually match English doc chunks purely on embedding geometry. gemini-embedding-001 is decent at this but measurably weaker than same-language; your own eval prints EN vs AR pass rates separately (`kb-retrieval-eval.ts:88-92`) — if the AR "covered" rate lags, the fix is to have the rewriter emit the query in the *language of the target corpus per topic*, or emit both languages and search twice (union). Flag, measure, then decide.

**🟡 One flat threshold for all source types.** `RAG_SIMILARITY_THRESHOLD: 0.6` (`ai.constant.ts:6`) applies equally to tight English API docs and noisy Arabic ASR transcripts. Transcript chunks systematically embed "fuzzier"; if session-recall feels weak, a per-source-type threshold (or lower floor + per-doc cap) is the tuning knob. Evidence-driven — your eval harness already measures it.

**🟡 Telemetry stored *in* the KB.** Every chunk row carries the whole document's `embedding_usage` and `provider_metadata` (`ingest-url.action.ts:92-93`, `ingest-video.action.ts:100-101`, `kb-ingest.ts:186-187`) — duplicated N-chunks times, purely write-time audit data living in a read-hot table. Harmless to the model, but it bloats every RPC response row. Move to a per-document log or drop it.

**✅ Model-facing hygiene is good.** Similarity scores are stripped from the prompt (`rag.ts:101` — commented out, correctly), `embedding_usage`/`provider_metadata` never reach the model (`rag.ts:96-115`), and the RAG prompt's language/citation contract (`prompts.ts:321-355`) is genuinely well-constructed. 🟡 One nit: chunk attribute values aren't escaped — a `document_id` containing `"` (PDF filenames can) would mangle the pseudo-XML (`rag.ts:110,113`).

**Eager-only retrieval** — locked decision, and I found no concrete problem it causes beyond the per-turn embed cost already accepted. No relitigating.

## 3. Performance & scale

**HNSW / raw-operator ordering — needs verification, can't be confirmed from the repo.** No migrations exist; the only evidence is the runbook SQL (`REBUILD-RUNBOOK.md:53`, which *does* use the raw ascending `<=>` correctly — modulo the shadowing bug above) and `PRE_DEPLOY_AUDIT.md`. **Verify live:** `EXPLAIN ANALYZE` the RPC body and confirm `Index Scan using … hnsw`; also confirm the index exists at all (`select indexname from pg_indexes where tablename='knowledge_base'`). At 33k rows a seq scan would still return in tens of ms, so you would *not* notice the missing index until the table grows — which is exactly why to check now.

**🟠 Query-rewrite is the hot-path latency tax.** Every follow-up turn serializes: rewrite LLM call → embed call → RPC → *then* `streamText` (`route.ts:64-79`). That's two full Google round-trips before the first token. At 80 users this is fine for throughput but is the dominant perceived-latency cost. Mitigations: lite model for rewrite (above), and/or run `convertToModelMessages` and the RAG build concurrently (minor), and/or skip rewrite when the latest message is long/self-contained (heuristic: >~80 chars with no demonstratives — cheap win).

**🟡 Sidebar realtime does a full refetch per event** (`use-chat-sessions-realtime.ts:21-34`) — self-acknowledged in the comment, fine at this scale.

**🟡 Chat page does 2 sequential queries** (`page.tsx:49-56` — session then messages). Could be parallel (`Promise.all`) since RLS covers ownership; ~1 RTT saved per load. Minor.

**🟡 No `maxDuration` export on `/api/chat`** (`route.ts`) — on Vercel, the default function duration may cut off long Gemini streams (3000-token Arabic answers with grounding can run tens of seconds). Needs verification on your plan; if deploying to Vercel, set `export const maxDuration = 60` (or higher with fluid compute).

**Service-role dependency on the chat hot path — accepted design, one note.** Every turn touches `createAdminClient()` twice (rate-limit + KB search). This is fine (server-only), but it means `SUPABASE_SERVICE_ROLE_KEY` rotation = instant full chat outage (fail-closed 503 via `admin.ts:12` throw → unhandled in `checkChatRateLimit`? — actually the throw in `createAdminClient` happens *outside* the try in `rate-limit.ts:19`, so it propagates as an unhandled route error, a raw 500 rather than a clean 503). 🟡 Wrap it or verify the failure mode.

**At 80 users / 33k chunks / busy day:** nothing structural breaks. The realistic failure modes are (a) Gemini per-project RPM/TPM quota under simultaneous classroom use — `maxRetries: 0` means students see the generic error banner, which is your deliberate "fail loudly" stance, but consider a 429-specific banner message; (b) the missing-HNSW scenario above; (c) Vercel function duration. `chat_request_log`'s exact count is indexed (`PRE_DEPLOY_AUDIT.md` §7 SQL) and cheap.

## 4. Security

**Owner gate — solid, one residual note.** `require-owner.ts:9-13` fails closed on unset `OWNER_EMAIL`; the proxy gate (`proxy.ts:65-67`) handles both localized and unlocalized paths correctly; all three ingestion actions re-check server-side (`ingest-url.action.ts:35-37`, `ingest-video.action.ts:28-30`, `documents.action.ts:24-29`). 🟡 Email comparison is case-sensitive (`require-owner.ts:12`) — Google normalizes case in practice, but `.toLowerCase()` both sides costs nothing.

**🔴 Client-message trust / SSRF** — covered in summary #2. Concrete fixes: cap total body size and per-message text length in the route; **reject or strip non-`data:` file-part URLs server-side**; cap decoded data-URL size (`normalize-ui-messages-for-model.ts:29-77` currently inlines unbounded content).

**🟠 `saveChatMessageAction` doesn't verify session ownership** (`chat.action.ts:20-37`) — it inserts with the caller's `user_id` but any `session_id`. Whether this matters depends entirely on the `chat_messages` RLS shape, which isn't in the repo. If SELECT policy is `auth.uid() = user_id`, injected rows are invisible garbage (cost: junk rows). If any policy derives visibility from the *session* (or ever will), this becomes cross-user message injection into a victim's transcript — a prompt-injection vector, since history is replayed to the model. **Verify the policy; add an ownership check (or a `chat_sessions` FK + policy `exists(select 1 from chat_sessions s where s.id = session_id and s.user_id = auth.uid())`) regardless.**

**✅ Redirect/auth correctness is good.** `safeNextPath` (`safe-next-path.ts:16-54`) blocks `//`, non-locale paths, `\`, and login loops; the OAuth callback (`api/auth/callback/route.ts`) sanitizes before redirecting; `getUser()` is used throughout (never `getSession()`). 🟡 One real nit: in `proxy.ts:72-88` and `:91-100`, the login/owner redirects construct a **fresh** `NextResponse.redirect` and drop any refreshed Supabase session cookies that were written onto the intl `response` (`proxy.ts:28-33`) — the documented `@supabase/ssr` pitfall. Effect is a benign re-refresh next request, but copy the cookies onto redirect responses to be correct.

**🟡 Secret-in-history / repo hygiene:** no secrets found in code; env access is properly server-only. `test-genai-rpd.mjs` is committed **twice** (root + `src/lib/utils/`) — flagged in your own audit as cleanup, still present; the `src/lib/utils` copy references the stale embedding model. `rest-of-urls` (empty) and `test/` (stray) are repo clutter. **Not verified:** whether `.env.local` was ever committed historically — `git log --all --diff-filter=A -- .env*` if you want certainty (one commit message mentions "fix .env again", which is worth a 30-second check).

**🟡 Chat sign-out is client-side** (`sidebar.tsx:65-69`) — violates your own "Sign out via Server Action" rule (CLAUDE.md); functional, but inconsistent with the stated auth posture.

## 5. Architecture, maintainability & doc drift

**The good, briefly:** provider catalog (`providers.ts`), memory-strategy swap point (`memory.ts`), the prompt-composition contract (persona composed into RAG rather than replaced, `prompts.ts:321`), guard extraction (`route-guard.util.ts`), and the error-envelope pattern (`chat-stream-error.util.ts`) are all clean, single-purpose, and well-commented. The `docs/study/*` flow docs are excellent and *current* — unlike CLAUDE.md.

**🟠 CLAUDE.md is materially stale — enumerated drifts:**
| CLAUDE.md says | Reality |
|---|---|
| Next.js 15 | Next **16.2.4**, React 19.2.4 (`package.json`) — with Next-16-specific behavior in play (`proxy.ts`, `proxyClientMaxBodySize`) |
| AI Chat: Groq `openai/gpt-oss-20b` "currently" | Active = `google:gemini-2.5-flash` (`providers.ts:110`) |
| Embeddings: `text-embedding-004` | `gemini-embedding-001` @ 768 via `outputDimensionality` (`embeddings.ts:13-23`) |
| `(dashboard)/chat`, `review/`, `resources/` | Chat lives at `[locale]/chat/[[...sessionId]]` *outside* `(dashboard)`; `(dashboard)` contains only `upload/`; no `review/` or `resources/` exist |
| `src/utils/supabase/` | Actually `src/lib/utils/supabase/` |
| "Protect routes in `middleware.ts`" | `src/proxy.ts` |
| Mutations: "Server Action → useMutation hook → component", `query-keys.constant.ts` | **No TanStack Query anywhere**; hooks call actions directly; the constants file doesn't exist |
| `yarn type-check` in commands | Not defined in `package.json` scripts |
| "Save messages in `onFinish`" ✓, "rate-limit every AI endpoint" ✓ | These two are actually true — noted for fairness |

Also `PRE_DEPLOY_AUDIT.md` (see summary #4) now misstates the per-turn cost ceiling, and `REBUILD-RUNBOOK.md:44-55` contains the broken SQL. For a codebase whose stated purpose includes being a learning artifact, the docs are the product — this drift is worth a dedicated pass.

**🟡 Dead / premature code:** `CODE_REVIEW_SYSTEM_PROMPT` (`prompts.ts:167-312`, ~150 lines) is explicitly parked for a future feature — acceptable per its comment, but it's 40% of the prompts file. The attachment-normalization machinery (`normalize-ui-messages-for-model.ts`, `model-capabilities.ts`, `attachments.tsx`) has **no UI that creates file parts** (`rag-chatbot.tsx` sends text only) — today it's reachable only by hand-crafted requests, i.e., it's simultaneously dead code *and* an attack surface (finding #2). Either wire attachments up or strip file parts at the route.

**🟡 `DisplayUsedTokens` duplicates the token readout already in `MessageInsights`** (`display-used-tokens.tsx` vs `message-insights.tsx:87-101`), and takes `lastMessage as ChatUIMessage` on a possibly-undefined value (`rag-chatbot.tsx:251`) — the cast papers over the type hole.

## 6. Type safety & code health

Genuinely clean: zero `any`/`@ts-ignore`/`eslint-disable` in app code (the only greps hit prose in a prompt), no `console.log`, consistent named-section components. Remaining items:

- 🟡 `lastMessage as ChatUIMessage` cast (`rag-chatbot.tsx:251`) — see above.
- 🟡 Casts-as-types at DB boundaries: `data as ChatSession[]` / `as ChatUIMessage[]` (`chat.service.ts:14,46`), `(data ?? []) as KnowledgeBaseSearchResult[]` (`search.ts:39`) — unvalidated trust of DB shape. Fine pragmatically; a Zod parse at the service layer is the strict-mode-complete version.
- 🟡 `getServerSupabaseAuth` logs `getUser` errors and continues (`auth-server-guard.ts:27-29`) — deliberate (missing session is an "error" there), correct behavior, just note that real auth *service* failures are indistinguishable from "not logged in" in logs.
- 🟡 Known vendored lint error `components/ui/carousel.tsx:98` still outstanding (tracked in PRE_DEPLOY_AUDIT §6).

## 7. UX & functionality

- **🟠 Upload surface is EN-only and off-brand** — `upload/page.tsx`, all three forms (`pdf-upload-form.tsx:26-68`, `url-ingestion-form.tsx`, `video-ingestion-form.tsx`) hardcode English strings and use `text-amber-100`/amber-button styling that matches nothing else in the app. Owner-only, so severity is limited — but it violates your zero-hardcoded-strings rule and looks like scaffolding.
- **🟠 Manual RTL toggle is a UX patch over a detectable signal.** `isArabicResponse` (`chat-ui.context.tsx:31`) only flips `dir` on the conversation container (`rag-chatbot.tsx:148`), defaults to LTR even for `ar`-locale users, resets on every new chat (`chat-ui.context.tsx:41`), and isn't persisted. Since your own prompt guarantees reply-language = latest-message-language, direction is *derivable* — per-message `dir="auto"` on bubbles (as already done for panel rows, `rag-insight-step.tsx:68,78`) would remove the toggle entirely.
- **🟡 URL-source chips in the insights panel aren't clickable and show raw URLs.** `extractRagSources` (`rag.ts:80-85`) sets `label = documentId` and only sets `url` for videos — but for URL sources the `document_id` *is* a URL and metadata carries a human `title` (`ingest-url.action.ts:91`). Students see `https://nextjs.org/docs/app/...` as dead text instead of a titled link (`rag-insight-step.tsx:66-83` renders links only when `url` is set).
- **🟡 Similarity percentages are student-facing** (`rag-insight-step.tsx:94-97`) — "62%" reads as "the mentor is 62% sure". Consider labels (high/medium) or hiding the number; this is the one place retrieval telemetry leaks to users, if not to the model.
- **✅ Failure states are mostly well-handled:** rate-limit banner with retry-seconds, generic error banner, truncation banner, typing indicator suppression logic (`rag-chatbot.tsx:95-113`) — good. The gap is the silent persist failures (finding in §1).
- 🟡 `formatRelativeTime` (`date.util.ts`) renders negative-future times if client clock skews behind DB (`rtf.format(-diffMinutes …)` with negative diff) — cosmetic.

## 8. Cost & ops

- **🟠 Per-turn cost accounting is stale** — summary #4. Re-trace: rewrite generation (+~500 input tokens) + 1 embed + ≤2 generations. Still small, still under the spend cap, but the documented ceiling is wrong and the rewrite is the most-frequent billable call.
- **🟡 `chat_request_log` grows unbounded — confirmed.** No pruning anywhere in `src/` or `scripts/`. At 80 users × 30/h worst case it's ~57k rows/day theoretical max, realistically far less — not urgent, but add a `pg_cron` delete of rows older than ~7 days before widening beta, since the check only ever reads a 1-hour window (`rate-limit.ts:22-29`).
- **🟡 Monitoring is console-only.** Every failure path is `console.error` (rate-limit check, RAG search, persistence, rewrite). On Vercel that's log-drain-or-nothing: you will not *know* retrieval has been degrading (e.g., silently falling back to the plain mentor prompt on every turn) unless a student tells you. Cheapest meaningful step: count RAG-fallback occurrences and rewrite failures somewhere queryable (even a `metadata` flag on the assistant message row), and set a Supabase/Vercel alert on 5xx rate.
- **🟡 Grounding cost** — accepted design, free under 1,500 queries/day; no per-day grounding counter exists though, so you'd only learn of overage from the bill/spend-cap. A daily count over `chat_messages.metadata->grounding` is a free query away.
- 🟡 Ops docs say `OWNER_EMAIL` + `chat_request_log` table are deploy prerequisites — both fail closed, good; just make sure they're in Vercel env for every environment (preview deploys will 503 chat without the table/key).

---

## Prioritized backlog

**Before widening beta (correctness/security, ~1–2 days):**
1. Verify live `search_knowledge_base` (shadowing + HNSW `EXPLAIN`) and fix `REBUILD-RUNBOOK.md:44-55` (rename param to `query_embedding`).
2. Harden `/api/chat` input: body-size cap, per-message char cap, strip/deny non-`data:` file parts (kills the SSRF path while attachments have no UI anyway).
3. Fix PDF ingestion to match URL/video: overwrite-by-`document_id`, add `source_type: "pdf"`, validate file presence/type, guard empty chunks (`documents.action.ts`).
4. Verify `chat_messages` RLS shape; add session-ownership check to `saveChatMessageAction`.
5. Verify/add the `chat_sessions.updated_at` touch trigger (or update it in `saveChatMessageAction`).
6. Set `maxDuration` on the chat route if deploying on Vercel.

**During beta (quality/UX):**
7. Chunking: markdown-aware separators + larger chunk size, re-ingest (biggest RAG-quality lever).
8. Per-document cap / MMR on the 10 retrieved chunks before prompt assembly.
9. Watch the eval's AR-vs-EN pass-rate gap; if real, make the rewriter corpus-language-aware.
10. Persist-failure UX (toast/retry) for user + assistant messages; URL sync on stream error.
11. Lite model for query rewrite (latency + cost).
12. `pg_cron` prune for `chat_request_log`; minimal RAG-fallback/grounding counters.
13. Clickable, titled URL sources in the insights panel; reconsider raw similarity %.
14. Replace the manual RTL toggle with per-message `dir="auto"`.

**Post-beta polish:**
15. Rewrite CLAUDE.md against reality (stack table, folder map, mutations pattern, commands); refresh PRE_DEPLOY_AUDIT cost trace.
16. i18n + restyle the upload surface; kill `text-amber-100`.
17. Delete `test-genai-rpd.mjs` (both copies), `rest-of-urls`, stray `test/`; unused deps sweep (already listed in your own audit §5).
18. Move `embedding_usage`/`provider_metadata` out of per-chunk KB metadata.
19. Fold `DisplayUsedTokens` into `MessageInsights`; remove the `as ChatUIMessage` cast; lowercase `isOwner` comparison; copy refreshed cookies onto proxy redirects.

**Deliberate trade-offs I'm explicitly *not* contesting:** eager-only retrieval, no provider fallback, per-user-only rate limiting (CGNAT rationale is sound), grounding kept on, `stepCountIs(2)`, sequential single-URL ingestion loop, and the parked code-review prompt. The design intent behind each is documented and coherent — the issue list above is about where implementation or docs diverge from that intent, not the intent itself.
