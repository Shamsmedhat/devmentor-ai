# DevMentor AI — Study & Rebuild Plan

> Goal: after working through this, rebuild this exact architecture **solo, without AI**, and reuse the plan to scaffold the same flow for a different product.
>
> Read-only study artifact. Every code claim cites a real `file:line`. **Code wins over any doc.**

## Files
| File | What it is |
|---|---|
| `LEARNING-PLAN.md` | **START HERE** — 6-day plan: reading order, concept per day, recall exercise per day |
| `CONCEPTS.md` | the transferable theory (embeddings, chunking, HNSW, eager RAG, cross-lingual, grounding/refusal, clean context) — own these repo-independent |
| `00-reuse-map.md` | GENERIC engine vs DEVMENTOR domain — the key to repurposing |
| `flow-1-chat-lifecycle.md` | chat page → useChat → /api/chat → streamText → persist |
| `flow-2-rag-retrieval.md` | query-rewrite → embeddings → search → rag (768 dims, graceful degrade) + eval tooling |
| `flow-3-ingestion.md` | **five** paths: PDF / URL / video actions + `kb:ingest` bulk-crawl + `kb:ingest-doc` → chunk → embedMany → Supabase |
| `flow-4-provider-catalog.md` | providers.ts, Gemini + Groq, no silent fallback |
| `flow-5-auth-guards.md` | Supabase SSR, OAuth callback, the **three** guards |
| `flow-6-cross-cutting.md` | rate-limit, memory, i18n/RTL |
| `REBUILD-RUNBOOK.md` | blank repo → working architecture, ordered steps (incl. 8b scripts, 11b quality gates) + live-env-var table |
| `MASTERY-CHECKLIST.md` | "without looking, can you…" self-test gates |

## Recommended order
Follow `LEARNING-PLAN.md` — it sequences the six flows day-by-day with per-day reading order and recall exercises (theory days pull in `CONCEPTS.md` sections). Day 7: walk `REBUILD-RUNBOOK.md` in an empty repo. Day 8: run `MASTERY-CHECKLIST.md` cold; any unticked box → reread that flow.

## How to use each flow doc
`A Purpose · B Trace (file:line hops) · C Decisions & WHY · D Data shapes · E Rebuild-from-blank · F Active-recall · G Pitfalls`. Read A–D with the files open; do E–F with the files **closed**; keep G in view while rebuilding.

## Inventory notes (what's real vs assumed)
- **Exists:** `docs/flows/` (UI walkthroughs — *not* engine flows), `devmentor-architecture.excalidraw` (diagram), `devmentor-walkthrough.html` (repo root), `docs/PROJECT_DEEP_DIVE.md`, `docs/PRE_DEPLOY_AUDIT.md`. These are mined only for "why" and labeled **rationale-from-docs**.
- *(Correction, 2026-07-06: an earlier revision of this file said `walkthrough.html` "does not exist" — the file exists as `devmentor-walkthrough.html` at the repo root.)*
- **Not in repo (owner-run in Supabase):** the `search_knowledge_base` RPC body, `vector(768)` table, HNSW index. The SQL in the runbook is **reconstructed from the observable contract** (`PROJECT_DEEP_DIVE.md:1099` confirms), never cited as a `file:line`.
- **No Figma node IDs** exist in the repo; none are referenced.
- **Doc-sourced numbers** (DKK 700 spend cap, "free <1,500 queries/day", $35/1k, CGNAT reasoning) come from `docs/PRE_DEPLOY_AUDIT.md` / `PROJECT_DEEP_DIVE.md` and are labeled, not presented as code.

## Idealized name → real file (the 6-flow used some idealized names)
| Idealized | Reality |
|---|---|
| `buildRagSystemPrompt` | ✅ `rag.ts:25` |
| `route-guard.util.ts` | ✅ exists (`chat/route-guard.util.ts:15`) but it's the **chat auth+rate-limit** guard — **not** the owner gate. Owner gate = `require-owner.ts:9` + `proxy.ts:65`. Three distinct guards (Flow 5). |
| `memory.ts` | ✅ a real file *and* the `slidingWindowWithAnchor` logic (`memory.ts:26,39`) |
| `embedMany` | ✅ wrapped by `generateEmbeddingsMany` (`embeddings.ts:31`) |

## Stale docs flagged (code wins) — verified 2026-07-06
| Doc claim | Reality in code |
|---|---|
| `CLAUDE.md`: Next.js 15 | Next **16.2.4** (`package.json:45`) |
| `CLAUDE.md`: AI chat = Groq `gpt-oss-20b` | active = **`google:gemini-2.5-flash`** (`providers.ts:110`); Groq entries are inactive catalog rows |
| `CLAUDE.md`: embeddings `text-embedding-004` | **`gemini-embedding-001`** @768 (`embeddings.ts:19,:13`) |
| `CLAUDE.md`: React Hook Form + Zod forms; TanStack `useMutation` 3-layer pattern | **neither RHF nor TanStack Query is in `package.json`** (0 grep hits); forms are `useState` + Zod `safeParse`; mutations are plain Server Actions + hooks |
| `CLAUDE.md` folder tree: `(dashboard)/chat`, `review/`, `resources/`, `utils/supabase/middleware.ts` | chat lives at `[locale]/chat/[[...sessionId]]`; dashboard group holds only `upload/`; no `review`/`resources` routes; no `middleware.ts` — the cookie bridge is inlined in `proxy.ts:17-35` |
| `.env.example`: `CHAT_MODEL_PROVIDER`, `OPENROUTER_API_KEY`, `AGENT_ROUTER_*` | **dead vars — zero references** in `src/`+`scripts/`; switching is the `ACTIVE_CHAT_PROVIDER_ID` constant, not env |
| `PRE_DEPLOY_AUDIT.md` §2: turn = 1 embed + ≤2 completions | predates the query-rewriter: +1 small bounded completion per multi-turn (`query-rewrite.ts:39-55`) — see Flow 2 §C |
| (assumption, not a doc) RTL auto-detected for replies | `<html dir>` is derived from locale (`layout.tsx:80`) but **chat reply direction is a manual toggle** (`chat-header.tsx:56`) |

**Dormant code, not dead code:** `CODE_REVIEW_SYSTEM_PROMPT` (`prompts.ts:167`) is wired to no route — kept intentionally for the planned `/api/review` (`prompts.ts:163-166`). Don't "clean it up," and don't study it as live behavior.
