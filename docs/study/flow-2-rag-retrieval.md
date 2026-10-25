# Flow 2 — RAG retrieval

> Day 2. The "search the KB and build the prompt" half of the turn.

## A. Purpose
Take the latest user message, find the most relevant KB chunks, and fold them into the system prompt — or fall back to the plain mentor prompt if nothing matches.

## B. The trace
| # | Hop | File:line | Moves to next |
|---|---|---|---|
| 1 | `buildRagSystemPrompt(trimmed)` entry | `rag.ts:25` | messages |
| 2 | Rewrite latest msg → one standalone query (resolves "this"/pronouns) | `rag.ts:28` → `query-rewrite.ts:29` | `query: string` |
| 3 | Empty query → return base mentor prompt, no sources | `rag.ts:29` | early `RagResult` |
| 4 | `searchKnowledgeBase(query, 10, 0.6)` | `rag.ts:33` → `search.ts:12` | results |
| 5 | Embed the query (768-dim) | `search.ts:27` → `embeddings.ts:15` | `embedding: number[]` |
| 6 | `rpc("search_knowledge_base", { embedding, match_count, threshold })` | `search.ts:29` | rows `{id,content,metadata,similarity}` |
| 7 | Search throws → catch → base mentor prompt (graceful) | `rag.ts:38-41` | early `RagResult` |
| 8 | Zero matches → base mentor prompt | `rag.ts:43-45` | early `RagResult` |
| 9 | Format chunks to XML; build `RAG_SYSTEM_PROMPT(context)` | `rag.ts:48` → `rag.ts:96`, `prompts.ts:321` | `system` |
| 10 | Dedupe + sort sources for the panel | `rag.ts:49` → `rag.ts:58` | `sources: RagSource[]` |

## C. Key decisions & WHY
- **Why 768 dims, not native 3072** (`embeddings.ts:13`, `outputDimensionality:22`) — `gemini-embedding-001` is natively 3072; the code requests 768 via `outputDimensionality`. *Rationale-from-docs:* `PROJECT_DEEP_DIVE.md:1218` — "768 dims balances quality vs index size". The DB column is `vector(768)`; query and stored vectors must match width.
- **Why graceful degradation, not erroring** (`rag.ts:17-24` doc comment, `:38-41`) — "the chat is more useful with stale context than dead." A transient pgvector error degrades to the plain mentor prompt instead of 500ing the route. Three fall-backs: no query, search throw, zero matches.
- **Query rewrite is search-only** (`query-rewrite.ts:17-28`) — the rewritten query feeds *only* the embedding; it never replaces the message sent to the model and never changes reply language. Fail-open: first turn or LLM error returns the raw latest message.
- **The rewrite has a real (bounded) cost** — it's a `generateText` call on the **active chat provider** every turn after the first (`query-rewrite.ts:39-40`), capped at 100 output tokens (`:15,:43`), fed only the last 6 turns clipped to 300 chars each (`:10,:13,:70-87`). It also sets its own `thinkingBudget:0` (`:50-54`) — `createModel()` doesn't carry the catalog's `streamOptions`, and Gemini's default thinking spend would starve a 100-token budget into empty output (silent fallback to the raw query). So a full turn = 1 small rewrite completion + 1 embed + ≤2 chat generations. (The audit's "≤2 completions" trace predates the rewriter — `PRE_DEPLOY_AUDIT.md:49-59` is stale on this one point.)
- **Similarity is NOT shown to the model** (`rag.ts:101` is a commented-out `similarity.toFixed(3)`) — `formatRetrievedContext` emits `<chunk source=...>` with content only; scores are used for sorting + the UI panel, never the prompt. The prompt also forbids leaking "Result 1:" scaffolding (`prompts.ts:354`).
- **Threshold + limit are clamped** (`search.ts:23-24`) — `limit→[1,50]`, `threshold→[0,1]`; defaults `RAG_MAX_RESULTS=10`, `RAG_SIMILARITY_THRESHOLD=0.6` (`ai.constant.ts:6,8`).
- **Search uses the admin client** (`search.ts:25`) — `knowledge_base` is queried only through the service-role RPC, not user RLS.

## D. Data shapes
- `RagResult { system: string; sources: RagSource[] }` — `rag.ts:10`.
- `KnowledgeBaseSearchResult { id, content, metadata, similarity }` — `search.ts:5`.
- `RagSource { id, label, sourceType?, similarity, url?, timestamp? }` — `chat.d.ts:40`.
- **Source-type-aware chunk XML** (`rag.ts:103-113`): video → `<chunk type="video" title=".." start=".." end=".." drive_url="..">…</chunk>`; other → `<chunk source="..">…</chunk>`.
- Dedup keys (`rag.ts:67-69`): video → `video:{doc}:{start_seconds}` (kept per timestamp); doc → `doc:{document_id}` (best score wins).

## E. Rebuild-from-blank (mechanism only)
1. `embed({ model, providerOptions:{ google:{ outputDimensionality:768 } }, value })`.
2. Postgres RPC: cosine search returning `similarity = 1 - (embedding <=> query)`, filtered `>= threshold`, `ORDER BY embedding <=> query ASC`, `LIMIT match_count`.
3. `buildPrompt(messages)`: rewrite query → search → if rows, inject as XML context; else return base prompt.
4. Wrap the search in try/catch returning the base prompt on failure.

## F. Active-recall exercise (~30 min)
Close the files. Reconstruct `buildRagSystemPrompt` from memory — all three early-return branches in order, and `formatRetrievedContext`'s two XML shapes. Then write the SQL signature of `search_knowledge_base` from its observable contract. Diff against `rag.ts` + Flow-2 §E. Score: did you put the threshold filter *and* the `<=>` ASC order? did you omit similarity from the XML?

## G. Pitfalls
- **HNSW only kicks in for raw `<=>` ascending order.** *Reconstructed / owner-run SQL (not in repo — `PROJECT_DEEP_DIVE.md:1099` confirms the body lives in Supabase).* If you `ORDER BY similarity DESC` (where `similarity = 1 - (… <=> …)`) or wrap the operator, the planner can skip the index → seq scan. Order by the raw distance ascending; compute `similarity` only in the SELECT list.
- **Dimension mismatch** — query vector must be 768 to match `vector(768)`; a 3072 vector errors at the RPC.
- **Re-introducing model-facing similarity** — keep `rag.ts:101` commented; scores in the prompt invite the model to quote "0.83" at students.
- **Threshold too high** silently returns zero rows → silent degrade to base prompt (looks like "RAG not working"). 0.6 is the tuned floor.
- **Tuning blind** — don't guess the threshold; measure it. `yarn kb:eval` scores golden questions (covered/deep/**control**) with EN vs AR pass rates + avg top-similarity (`kb-retrieval-eval.ts:56-66,:87-95`; questions in `scripts/kb-eval-questions.json`). A control question clearing the threshold flags `BAD-CONTROL` (false positive). `yarn kb:integrity` catches the silent KB corruptions retrieval can't see: NULL embeddings, wrong dims vs 768, empty content, suspiciously small sources (`kb-integrity.ts:15-70`).
