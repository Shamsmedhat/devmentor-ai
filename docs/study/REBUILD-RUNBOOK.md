# REBUILD RUNBOOK — blank repo → this architecture

> Ordered so each step runs before the next. Stack is locked: Next 16.2.4 (App Router, Turbopack) · TS strict · Tailwind v4 + shadcn/ui + ai-elements · Supabase (pgvector, HNSW) · Vercel AI SDK v6 + Gemini 2.5 Flash (Groq manual fallback) · `gemini-embedding-001` @768 · AssemblyAI · Firecrawl · next-intl v4 · Yarn v1 · Vercel.
>
> **SQL below is reconstructed from the observable contract** (`search.ts:29`, `documents.action.ts:78`) — the real bodies are **owner-run in Supabase, not in the repo** (`PROJECT_DEEP_DIVE.md:1099`). Verify against your DB.

## Env vars actually read by code (grep-verified)
| Var | Read at | Step |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | `@ai-sdk/google` default (chat + embeddings + grounding) | 3, 5 |
| `GROQ_API_KEY` | `providers.ts:86,:94` (`apiKeyEnv`) | 5 |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `server.ts:8-9`, `proxy.ts:18-19`, callback | 2, 9 |
| `SUPABASE_SERVICE_ROLE_KEY` | `admin.ts:5` | 2 |
| `FIRECRAWL_API_KEY` | `firecrawl.service.ts:53` | 8 |
| `ASSEMBLYAI_API_KEY` | `assemblyai-transcribe.service.ts:31` | 8 |
| `OWNER_EMAIL` | `require-owner.ts:10` (fail-closed) | 9 |
| `NEXT_PUBLIC_SITE_URL` | `[locale]/layout.tsx:49` (metadataBase) | 1 |

⚠️ `.env.example` also lists `CHAT_MODEL_PROVIDER`, `OPENROUTER_API_KEY`, `AGENT_ROUTER_API_KEY`, `AGENT_ROUTER_BASE_URL` — **dead: zero references in `src/` or `scripts/`.** Provider switching is the `ACTIVE_CHAT_PROVIDER_ID` constant (`providers.ts:110`), not an env var. Don't carry these into a rebuild.

---

### 1. Scaffold
- Create: Next 16 app, `yarn`, TS strict, Tailwind v4, shadcn/ui, ai-elements.
- Decision: App Router + Turbopack; Yarn v1 only.
- Test: `yarn dev` serves a blank page.

### 2. Supabase + pgvector + tables + index + RPC
- Create (owner-run SQL):
  ```sql
  create extension if not exists vector;

  create table knowledge_base (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    embedding vector(768) not null,
    metadata jsonb not null default '{}'::jsonb
  );

  -- HNSW on the cosine operator class
  create index on knowledge_base
    using hnsw (embedding vector_cosine_ops);

  create or replace function search_knowledge_base(
    embedding vector(768), match_count int, threshold float8
  )
  returns table (id uuid, content text, metadata jsonb, similarity float8)
  language sql stable as $$
    select kb.id, kb.content, kb.metadata,
           1 - (kb.embedding <=> embedding) as similarity
    from knowledge_base kb
    where 1 - (kb.embedding <=> embedding) >= threshold
    order by kb.embedding <=> embedding   -- RAW operator, ASC → HNSW is used
    limit match_count;
  $$;
  ```
  Plus `chat_sessions`, `chat_messages`, `chat_request_log` (see §10/§11), all RLS-enabled.
- Decision (the one that matters): **`ORDER BY embedding <=> embedding` ascending, raw.** Computing `similarity` in SELECT is fine; ordering by it (or wrapping the operator) makes the planner skip HNSW.
- Test: `select * from search_knowledge_base(<zeros>, 5, 0)` returns rows; `explain` shows an index scan.

### 3. Embeddings module (768)
- Create: `lib/ai/embeddings.ts` — `generateEmbeddings` + `generateEmbeddingsMany`.
- Decision: `providerOptions.google.outputDimensionality = 768` (native is 3072; 768 must match `vector(768)`).
- Test: `generateEmbeddings("hi")` returns a length-768 array.

### 4. Search + RAG (eager-only, threshold, graceful, NO model-facing similarity)
- Create: `lib/ai/search.ts` (RPC wrapper, clamp limit/threshold), `lib/ai/rag.ts` (`buildRagSystemPrompt`), `lib/constants/ai.constant.ts`.
- Decision: search runs every turn (eager); on any failure return the base prompt; format chunks as XML **without** similarity scores.
- Test: a query that matches injects `<chunk source=…>`; a forced RPC error still returns a prompt (no 500).

### 5. Provider catalog (no silent fallback)
- Create: `lib/ai/providers.ts`, `lib/ai/model-capabilities.ts`.
- Decision: one `ACTIVE_CHAT_PROVIDER_ID`; `getActive()` **throws** if missing; Gemini gets `googleSearch({})` + `thinkingBudget:0`; Groq gpt-oss gets `structuredOutputs:false`.
- Test: set the id to a bogus value → request throws loudly (not a fallback).

### 6. `/api/chat` route
- Create: `app/api/chat/route.ts` (+ `route-guard.util.ts`, `rate-limit.ts`, `normalize-ui-messages-for-model.ts`, `memory.ts`).
- Decision order: **guard → parse → provider → normalize → memory → buildRagSystemPrompt → convert → log → streamText → stopWhen stepCountIs(2) → progressive `messageMetadata` → `sendReasoning:false`.**
- Test: `curl` with one message streams tokens; metadata `start` carries `provider` (+ `rag` when matched).

### 7. `useChat` client + streamed UI + session persistence (RLS)
- Create: `rag-chatbot.tsx` (`useChat` + `DefaultChatTransport`), `use-chat-persistence.ts`, `chat.action.ts`, `chat.service.ts`, the server page.
- Decision: persist user msg at send time, assistant msg in `onFinish`; sync URL with `history.replaceState` (no navigation).
- Test: send a message → both rows land in `chat_messages`; refresh re-hydrates the panel from stored `metadata`.

### 8. Ingestion (PDF / URL / video)
- Create: `chunking.ts`, `video-chunker.ts`, `firecrawl.service.ts`, `assemblyai-transcribe.service.ts`, the three `*.action.ts`, Zod schemas.
- Decision: `embedMany` in batches (50, 1s pause); delete-overwrite by `metadata->>document_id` for re-ingestable sources.
- Test: upload a small PDF → N rows in `knowledge_base`; the chat can then cite it.

### 8b. Bulk KB toolchain (scripts — the volume path)
- Create: `scripts/kb-map.ts` + `kb-urls/sites.config.ts` (discovery), `scripts/kb-ingest.ts` (bulk URL ingest), `scripts/kb-ingest-doc.ts` (curated local .md), `lib/utils/url-normalize.ts`, `mapUrls` in the firecrawl service; wire `package.json` scripts with `tsx --env-file=.env.local` (`package.json:10-14`).
- Decisions (each one is load-bearing):
  - **Human review gate**: `kb:map` writes `<lib>.txt` + `.raw.json` and does NOT scrape/embed; a human prunes the list before `kb:ingest` spends credits (`kb-map.ts:1-12`).
  - **Filter client-side**: Firecrawl `/map` is domain-wide; include/exclude + same-host guard run in your code (`firecrawl.service.ts:96-162`). `limit` is a safety cap, not scope.
  - **Stable ids**: key `document_id` on `normalizeUrl(input)` (`kb-ingest.ts:148`), and never ingest the same page through UI *and* script (`url-normalize.ts:10-13`).
  - **Survive long runs**: per-URL checkpoint (atomic tmp+rename, `kb-ingest.ts:81-89`), failures to a `--retry-failed` file, `--max-pages` cost stop, records built BEFORE delete+insert + LOUD data-loss log (`:176-208`).
- Test: `yarn kb:map <lib>` → review `.txt` → `yarn kb:ingest <lib> --max-pages 3` → 3 pages land; kill it mid-run, re-run, it resumes.

### 9. Auth (Supabase SSR + Google OAuth + callback + owner guard)
- Create: `utils/supabase/{server,client,admin}.ts`, `proxy.ts`, `api/auth/callback/route.ts`, `auth-server-guard.ts`, `require-owner.ts`.
- Decision: `getUser()` not `getSession()`; owner gate fails closed; gate ingestion in middleware **and** in each action.
- Test: anonymous → redirected off `/chat`; non-owner → redirected off `/upload`; owner → reaches `/upload`.

### 10. Cross-cutting
- Create: `chat_request_log` (RLS on, no policies), wire `checkChatRateLimit`/`logChatRequest`; next-intl `routing`/`request`; `<html dir>` from locale.
  ```sql
  create table chat_request_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null, ip text, created_at timestamptz not null default now()
  );
  create index on chat_request_log (user_id, created_at);
  alter table chat_request_log enable row level security;  -- no policies → service-role only
  ```
- Decision: rate-limit check fails closed, log fails open; per-user (not per-IP).
- Test: exceed the cap → 429 with the rate-limit banner; a logging failure doesn't block chat.

### 11. Session tables RLS
- Create: `chat_sessions`/`chat_messages` with `auth.uid() = user_id` policies; enable realtime on `chat_sessions`.
- Test: user A cannot read user B's sessions; sidebar updates live on insert.

### 11b. KB quality gates (before trusting retrieval)
- Create: `scripts/kb-integrity.ts` (counts, NULL embeddings, dim-vs-768 sample, empty content, smallest sources) and `scripts/kb-retrieval-eval.ts` + a golden `kb-eval-questions.json` — **covered**, **deep**, and **control** (should-miss) questions, in BOTH product languages.
- Decision: controls catch a too-permissive threshold (`BAD-CONTROL`, `kb-retrieval-eval.ts:59-66`); the EN-vs-AR aggregate split (`:87-95`) catches a threshold that only works for one language.
- Test: `yarn kb:integrity` shows 0 NULLs / 0 dim violations; `yarn kb:eval` → covered questions PASS, controls GOOD-CONTROL.

### 12. FINAL — swap the domain
- Change **only**: `prompts.ts` (persona, scope, escalation, roadmap), `kb-docs/` (new product's content, re-ingested via `kb:ingest-doc`), `messages/*.json` (copy), `kb-urls/sites.config.ts` (which docs sites to crawl), `scripts/kb-eval-questions.json` (new golden set), and ar-first defaults if the new product isn't Arabic.
- Decision: leave every GENERIC module untouched (see `00-reuse-map.md`).
- Test: same engine, new persona answers in-domain and refuses out-of-domain; `yarn kb:eval` passes on the new golden set.
