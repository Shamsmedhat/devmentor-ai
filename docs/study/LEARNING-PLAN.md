# LEARNING PLAN — 6 days to own this codebase

> The day-by-day version of the study set. Each day: **read in this order → the concept it teaches → an active-recall exercise done with the files CLOSED.** Do the exercise before moving on; reading feels like learning, reconstruction *is* learning. Every path below is real (verified 2026-07-06); code wins over any doc.
>
> Pace assumption: ~4–6 focused hours/day. If a day runs long, push the exercise to the next morning — never skip it.

---

## Day 1 — The spine: one chat turn, end to end (Flow 1)

**Read, in order:**
1. `package.json:5-14` — the scripts tell you what the repo *does* (dev/build + 5 `kb:*` tools).
2. `src/app/api/chat/route.ts` (all 187 lines) — the whole server turn: guard `:29` → parse `:33` → provider `:47` → normalize `:57` → memory `:64` → RAG `:70` → convert `:73` → log `:77` → `streamText` `:79-92` → metadata emitter `:113-169`.
3. `src/components/features/chat/chat-section/rag-chatbot.tsx` — `useChat` `:71-87`, `sendText` `:117-137`.
4. `src/hooks/chat/use-chat-persistence.ts` — `ensureSessionId` `:39-45`, `persistAssistantMessage` + URL sync `:66-84`.
5. `src/components/features/chat/chat-section/chat-instance.tsx:25` — the remount key.
6. `src/app/[locale]/chat/[[...sessionId]]/page.tsx` — server-side hydration `:48-57`, catch-all reject `:33`.
7. `docs/study/flow-1-chat-lifecycle.md` — confirm your mental model against the trace.

**Concept:** a streaming AI endpoint is an *ordered pipeline*, and the order is load-bearing (auth before cost, RAG before convert, log before stream). The AI SDK's `UIMessage` parts + metadata are the contract between server and client.

**Active recall (~40 min):** blank file. Write the `POST` handler skeleton from memory — every step in order, the four `messageMetadata` branches (`start`/`source`/`finish-step`/`finish`), and where user vs assistant messages get persisted. Diff against `route.ts`. Pass = order correct, no missing guard/log, RAG sources emitted on `start` only.

---

## Day 2 — Retrieval: embeddings → RPC → prompt (Flow 2 + Concepts 1–4)

**Read, in order:**
1. `docs/study/CONCEPTS.md` §1–§4 (embeddings, chunking, HNSW, eager-vs-tool) — theory *first* today, the code is short.
2. `src/lib/ai/embeddings.ts` — 768 via `outputDimensionality` `:13,:22`, batching `:41-62`.
3. `src/lib/ai/search.ts` — clamps `:23-24`, admin client `:25`, RPC `:29`.
4. `src/lib/ai/query-rewrite.ts` — fail-open contract `:17-28`, first-turn skip `:36`, its own `thinkingBudget:0` `:50-54`.
5. `src/lib/ai/rag.ts` — the three degrade branches `:29,:38-41,:43-45`, chunk XML `:96-116`, the commented-out similarity `:101`.
6. `src/lib/ai/prompts.ts:321-355` — `RAG_SYSTEM_PROMPT`, and `:366-391` the rewrite prompt.
7. `docs/study/flow-2-rag-retrieval.md`.

**Concept:** eager RAG = fixed cost, sources known before streaming; graceful degradation = a retrieval failure must never kill the chat; the model never sees retrieval telemetry.

**Active recall (~40 min):** blank file. (a) Reconstruct `buildRagSystemPrompt` — all three early returns in order. (b) Write the `search_knowledge_base` SQL from its observable contract: `similarity = 1 - (embedding <=> query)` in SELECT, threshold filter, `ORDER BY` the **raw operator ascending**, LIMIT. (c) One sentence: what does the query-rewrite cost per turn and what must it never affect? Diff against `rag.ts` + `REBUILD-RUNBOOK.md` §2.

---

## Day 3 — Ingestion: five paths, one tail (Flow 3)

**Read, in order:**
1. `src/lib/ai/chunking.ts` (14 lines) and `src/lib/ai/video-chunker.ts` — the greedy loop `:35-57`, the `Math.max(i+1, j-overlapWords)` advance `:56`.
2. `src/lib/actions/documents.action.ts` (PDF, append-only), `ingest-url.action.ts` (delete-overwrite `:76-83`), `ingest-video.action.ts` (timestamps `:90-103`).
3. `src/lib/services/firecrawl.service.ts` — `scrapeUrl` `:65`, then `mapUrls` `:110-176` incl. the same-host guard `:137-162`.
4. `src/lib/utils/url-normalize.ts` — read the WHOLE doc comment `:1-25`; the two-keying warning `:10-13` is the trap of the day.
5. `scripts/kb-map.ts` → `kb-urls/sites.config.ts` (`SiteConfig` `:18`, `SITES` `:31`) → `scripts/kb-ingest.ts` (resume `:64-90`, main loop `:147-222`, DATA-LOSS warning `:202-208`).
6. `scripts/kb-ingest-doc.ts` — the path that feeds `kb-docs/rose-app-*.md`.
7. `docs/study/flow-3-ingestion.md` + `CONCEPTS.md` §2.

**Concept:** ingestion is "extract → chunk → embed (batched) → idempotent overwrite," hardened differently per trust level: UI actions are owner-gated; scripts add resume checkpoints, skip-and-continue, and loud failure when the delete-insert gap breaks.

**Active recall (~45 min):** blank file. (a) Write `generateEmbeddingsMany`'s batch loop, including the sleep-only-if-more-batches condition. (b) Write the video chunker's inner while-loop + advance line, and say why it can't infinite-loop. (c) Table from memory: the 4 `source_type` metadata shapes (pdf/url/video/doc) and which paths overwrite. (d) One paragraph: design a 6th path (e.g. GitHub README ingester) — which existing pieces do you reuse verbatim? Diff against the sources.

---

## Day 4 — The brain: providers, prompts, grounding (Flow 4 + Concepts 6)

**Read, in order:**
1. `src/lib/ai/providers.ts` (all 121 lines) — catalog `:83-108`, the one switch `:110`, throw-don't-fallback `:112-120`, per-provider `streamOptions` `:60-81`.
2. `src/lib/ai/model-capabilities.ts` + `src/lib/ai/normalize-ui-messages-for-model.ts:83-122` — how attachments degrade per model.
3. `src/lib/ai/prompts.ts` **in full** (392 lines, the domain heart): persona `:5-9`, scope `:11-26`, roadmap `:28-33`, out-of-scope `:35-55`, voice `:57-66`, tool decision tree `:68-86`, escalation `:104-111`, the dormant `CODE_REVIEW_SYSTEM_PROMPT` `:167` (note `:163-166`: not wired to any route).
4. `CONCEPTS.md` §6 (grounding/refusal) and §7.
5. `docs/study/flow-4-provider-catalog.md`.

**Concept:** the provider catalog isolates *how models differ* (tools, thinking, attachments) behind one interface; the prompt implements a **two-domain truth policy** — general tech (web/memory OK) vs institution facts (KB-only, refuse + escalate).

**Active recall (~40 min):** blank file. (a) Reconstruct `CHAT_PROVIDERS` (3 entries: which gets `structuredOutputs:false` and why, which gets `thinkingBudget:0` and why) + `getActiveChatProvider`. (b) From memory, write the 4-step browser_search decision tree and the institution-facts rule, then check `prompts.ts:68-86,:333-334`. Score yourself on: did your `getActive` throw?

---

## Day 5 — The doors: auth, OAuth, three guards (Flow 5)

**Read, in order:**
1. `src/lib/utils/supabase/server.ts`, `client.ts`, `admin.ts` — the three clients; note `persistSession:false` `admin.ts:17`.
2. `src/proxy.ts` — cookie bridge `:17-35`, owner gate `:65`, protected redirect `:70-88`, login bounce `:91-100`, matcher `:107`.
3. `src/app/api/auth/callback/route.ts` — `exchangeCodeForSession` `:43`.
4. `src/lib/utils/auth/safe-next-path.ts` — every rejection rule `:24-50`.
5. `src/lib/utils/auth/auth-server-guard.ts` (`getUser` `:25`, throwing variant `:38`), `src/lib/utils/require-owner.ts:9-13`, `src/lib/utils/chat/route-guard.util.ts`.
6. `src/lib/actions/chat.action.ts` + `src/lib/services/chat.service.ts` — RLS-scoped writes/reads.
7. `docs/study/flow-5-auth-guards.md`.

**Concept:** three guards, three surfaces — middleware gates *pages*, `guardChatRoute` gates the *API* (excluded from the matcher), `isOwner` gates *ingestion* (checked in middleware AND inside every action, because actions are directly callable). Privilege boundaries fail closed.

**Active recall (~30 min):** on paper, trace 4 requests: anonymous → `/ar/chat`; non-owner → `/en/upload`; owner → `/en/upload`; sessionless `POST /api/chat`. Name the guard that fires, the file, and the exact outcome (redirect target / status code). Then write `safeNextPath`'s rejection list from memory. Diff against `proxy.ts` + `safe-next-path.ts`.

---

## Day 6 — The glue + the gauges: rate-limit, memory, i18n, eval (Flow 6)

**Read, in order:**
1. `src/lib/ai/rate-limit.ts` — fail-closed check `:32-34` vs fail-open log `:51-64`.
2. `src/lib/ai/memory.ts` — anchor strategy `:26-33`, the one-line swap `:39`.
3. `src/i18n/routing.ts`, `src/app/[locale]/layout.tsx:80` (`<html dir>`), `chat-ui.context.tsx:31,:41` + `chat-header.tsx:54-81` (the manual reply-direction toggle).
4. `src/lib/utils/chat/chat-stream-error.util.ts` — the error envelope both 429 and stream errors share.
5. `scripts/kb-integrity.ts` and `scripts/kb-retrieval-eval.ts` — flag logic `:56-66`, EN/AR aggregates `:87-95`; skim `scripts/kb-eval-questions.json` (covered/deep/control).
6. `CONCEPTS.md` §5 (cross-lingual) + the bonus section; `docs/study/flow-6-cross-cutting.md`.

**Concept:** cross-cutting concerns each pick a failure direction on purpose (deny on unknown cost, allow on lost telemetry), and retrieval quality is *measured*, not assumed — golden questions with control (should-miss) cases, split by language.

**Active recall (~40 min):** blank file. (a) Write `checkChatRateLimit` + `logChatRequest` with the asymmetry correct. (b) Write `slidingWindowWithAnchor`. (c) One line each: where `<html dir>` comes from vs where chat reply direction comes from. (d) Write the eval flag table from memory: covered×hit, covered×miss, control×hit, control×miss → PASS / REVIEW / BAD-CONTROL / GOOD-CONTROL. Diff against sources.

---

## Day 7 (capstone) — Rebuild on paper
Walk `REBUILD-RUNBOOK.md` in an **empty folder**: create the file tree stubs and write the owner-run SQL by hand (table + HNSW index + RPC) before peeking. Wire a minimal `route.ts` from your Day-1 reconstruction. You are not re-typing the app — you are proving the *order* and the *decisions* are yours now.

## Day 8 (gate) — Cold test
Run `MASTERY-CHECKLIST.md` top to bottom with everything closed. Any unticked box → reread that flow's §B trace and redo that day's exercise. The checklist is the exit exam; the flows are the textbook.

---

## Rules for the whole week
- **Reconstruct, then diff.** Reading the diff of *your* attempt teaches 10× what rereading the source does.
- **Chase every "why" to its citation.** If a doc's claim has no `file:line`, treat it as unverified.
- **Don't study `components/ui/*`** (shadcn vendor code) or the landing sections — zero architectural payload.
- Where CLAUDE.md and code disagree (Next 15 vs 16, RHF/TanStack claims, `text-embedding-004` vs `gemini-embedding-001`) — **code wins**; the drift list lives in `README.md`.
