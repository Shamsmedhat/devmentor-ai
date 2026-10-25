# 00 — Generic engine vs DevMentor domain

> The reuse key. **GENERIC ENGINE** = keep as-is for any RAG-chat product. **DEVMENTOR DOMAIN** = swap to change purpose. Code wins; doc-sourced rationale labeled.

## The map

| Module / decision | File:line | Class | To repurpose, change… |
|---|---|---|---|
| `POST /api/chat` orchestration | `route.ts:27` | GENERIC | nothing |
| `streamText` + progressive `messageMetadata` | `route.ts:79,118` | GENERIC | nothing |
| `useChat` + transport + persistence | `rag-chatbot.tsx:71`, `use-chat-persistence.ts` | GENERIC | nothing |
| Embeddings (768 via `outputDimensionality`) | `embeddings.ts:13` | GENERIC | only if you change embedding model/dims |
| `search.ts` + `search_knowledge_base` RPC | `search.ts:12` | GENERIC | nothing (schema-agnostic) |
| `rag.ts` pipeline + graceful degrade | `rag.ts:25` | GENERIC | nothing |
| Chunking (text + video) | `chunking.ts`, `video-chunker.ts` | GENERIC | tune sizes per content type |
| Provider catalog + no-fallback | `providers.ts` | GENERIC | the active id / which models |
| Attachment normalization | `normalize-ui-messages-for-model.ts` | GENERIC | nothing |
| Memory strategy | `memory.ts:39` | GENERIC | the limit / strategy |
| Rate limit (per-user, fail-closed) | `rate-limit.ts` | GENERIC | the per-hour cap |
| Auth: SSR + OAuth callback + guards | `proxy.ts`, `auth/callback`, `route-guard.util.ts` | GENERIC | OAuth provider, protected roots |
| Owner gate (env allowlist, fail-closed) | `require-owner.ts:9` | GENERIC | the env var name |
| i18n routing + RTL plumbing | `i18n/*`, `layout.tsx:80` | GENERIC | the locale set |
| Bulk-crawl toolchain (map→review→ingest, resume) | `kb-map.ts`, `kb-ingest.ts`, `firecrawl.service.ts:110` | GENERIC | nothing |
| Local-doc ingester (`kb:ingest-doc`) | `kb-ingest-doc.ts` | GENERIC | nothing |
| KB integrity + retrieval eval harness | `kb-integrity.ts`, `kb-retrieval-eval.ts` | GENERIC | nothing (the harness) |
| URL normalization (stable `document_id`s) | `url-normalize.ts:26` | GENERIC | nothing |
| **Crawl targets (which libs' docs)** | `kb-urls/sites.config.ts:31` (`SITES`) | **DOMAIN** | the sites your product's students need |
| **Golden eval questions (en/ar, covered/control)** | `scripts/kb-eval-questions.json` | **DOMAIN** | questions for the new product's KB |
| **Mentor persona / scope / escalation** | `prompts.ts:5` (`MENTOR_SYSTEM_PROMPT`) | **DOMAIN** | persona name, voice, scope, off-topic rules |
| **"Elevate Mentor" / Elevate Tech identity** | `prompts.ts:5-9` | **DOMAIN** | institution name + default-referent rule |
| **Rose App / 6 sprints / Dashboard roadmap** | `prompts.ts:28-33` | **DOMAIN** | the curriculum/product roadmap block |
| **Institution-facts vs general-knowledge rule** | `prompts.ts:334,351` | **DOMAIN** | what counts as "official" vs web-answerable |
| **Escalation / gap templates (ar/en)** | `prompts.ts:336-343` | **DOMAIN** | who to escalate to, phrasing |
| **Video-citation blockquote format** | `prompts.ts:345-347` | **DOMAIN** (presentation) | the citation shape, or drop if no video KB |
| **RAG context-usage prompt** | `prompts.ts:321` (`RAG_SYSTEM_PROMPT`) | mostly DOMAIN | language + citation policy |
| **Query-rewrite prompt examples** | `prompts.ts:366` | mostly GENERIC | the ar/en examples are domain-flavored |
| **KB content** (`kb-docs/rose-app-*` + `sprint-1-*`, one focused file per topic) | `kb-docs/` (21 files) | **DOMAIN** | replace with new product's docs, re-run `kb:ingest-doc` |
| **ar-first defaults** (transcription `language_code:"ar"`, ar suggestions) | `assemblyai-transcribe.service.ts:52`, `messages/*` | **DOMAIN** | default language |
| **UI strings** (`messages/ar.json`, `en.json`) | `messages/` | **DOMAIN** | copy for the new product |

## One-line summary
The entire pipeline (chat → RAG → ingest → scripts → providers → auth → cross-cutting) is **GENERIC**. The product identity lives almost entirely in **`prompts.ts`** + **`kb-docs/`** + **`messages/`**, plus two small config surfaces: **`sites.config.ts`** (what to crawl) and **`kb-eval-questions.json`** (what retrieval must answer). Swap those five and you have a different product on the same engine. See `REBUILD-RUNBOOK.md` final step.
