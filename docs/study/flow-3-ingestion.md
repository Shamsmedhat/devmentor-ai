# Flow 3 — Ingestion (PDF / URL / video / doc / bulk-crawl)

> Day 3. How content becomes searchable KB rows. **Five entry paths, one tail** (chunk → embedMany → insert): three in-app owner actions + two CLI script paths (`yarn kb:ingest`, `yarn kb:ingest-doc`).

## A. Purpose
Owner uploads a PDF, a URL list, or a lecture audio file via the app — or runs the scripts to bulk-crawl docs sites and ingest curated local markdown (`kb-docs/*.md`). Either way: text is extracted, chunked, embedded in batches, and written to `knowledge_base`.

## B. The trace — in-app actions
All three are `"use server"` actions; all auth-check then owner-check before any expensive work.

**PDF** — `documents.action.ts`
| # | Hop | File:line |
|---|---|---|
| 1 | `processPdfFileAction(formData)`; auth + `isOwner` | `:11-29` |
| 2 | `new PDFParse({ data }).getText()` | `:38-44` |
| 3 | `chunkText(text)` (500/50) | `:55` → `chunking.ts:3` |
| 4 | `generateEmbeddingsMany(chunks)` | `:58` → `embeddings.ts:31` |
| 5 | insert rows; `metadata.document_id = file.name` (no `source_type`, no overwrite) | `:64-87` |

**URL** — `ingest-url.action.ts`
| # | Hop | File:line |
|---|---|---|
| 1 | `ingestUrlsAction(input)`; auth + `isOwner`; Zod parse | `:25-46` |
| 2 | per URL, sequential: `scrapeUrl(url)` (markdown) | `:57` → `firecrawl.service.ts:65` |
| 3 | `chunkText(page.markdown)` | `:59` |
| 4 | `generateEmbeddingsMany(chunks)` | `:69` |
| 5 | **delete prior chunks for this `document_id`** then insert; `source_type:"url"` | `:76-105` |

**Video** — `ingest-video.action.ts`
| # | Hop | File:line |
|---|---|---|
| 1 | `ingestVideoAction(formData)`; auth + `isOwner`; Zod parse | `:19-52` |
| 2 | `transcribeAudio(buffer)` — AssemblyAI, `language_code:"ar"` | `:58` → `assemblyai-transcribe.service.ts:42-54` |
| 3 | `chunkTranscriptWithTimestamps(words, {500,10})` | `:60` → `video-chunker.ts:26` |
| 4 | `generateEmbeddingsMany(chunks.map(c=>c.content))` | `:72` |
| 5 | delete-overwrite then insert; `source_type:"video"`, `start/end_seconds`, optional `drive_url` | `:81-103` |

## B2. The trace — script paths (`scripts/`, run with `tsx --env-file=.env.local`, `package.json:10-14`)
No auth guard here — trust boundary is *shell access to `.env.local`* (service-role key). Never expose these as endpoints.

**Doc** — `yarn kb:ingest-doc <filePath> <documentId> [--source-type doc]` (`kb-ingest-doc.ts`) — how `kb-docs/rose-app-*.md` gets in
| # | Hop | File:line |
|---|---|---|
| 1 | args: positional `filePath` + `documentId`; optional `--chunk-size/--chunk-overlap` | `:45-66` |
| 2 | `readFileSync` + `chunkText(text, chunkSize, chunkOverlap)` | `:63,:68` |
| 3 | `generateEmbeddingsMany(chunks)` | `:78` |
| 4 | build ALL records **before** delete+insert (minimizes the non-transactional gap) | `:80-89` |
| 5 | delete by `metadata->>document_id` → insert; insert failure logs `!!! DATA LOSS` | `:94-111` |

**Bulk crawl** — two phases with a **human review gate** between them:
| # | Hop | File:line |
|---|---|---|
| 1 | *Phase 1* `yarn kb:map <lib>` — reads `kb-urls/sites.config.ts` (`SiteConfig:18`, `SITES:31`) | `kb-map.ts:27-49` |
| 2 | `mapUrls(root, {include,exclude,limit})` — Firecrawl `/map` is **domain-wide**; include/exclude filtering runs in our code; same-host guard always applies | `firecrawl.service.ts:110-162` |
| 3 | writes `kb-urls/<lib>.txt` (filtered, for review) + `<lib>.raw.json` (pre-filter audit) — **no scrape, no embed, no DB** | `kb-map.ts:52-73` |
| 4 | *human reviews `<lib>.txt`* — the gate between discovery and spend | `kb-map.ts:89-91` |
| 5 | *Phase 2* `yarn kb:ingest <lib>` — reads the reviewed list; per URL: `normalizeUrl` → skip if checkpointed → scrape → chunk → embed → overwrite | `kb-ingest.ts:147-222` |
| 6 | resume: completed ids checkpointed to `kb-urls/.progress/<lib>.json` (atomic tmp+rename) | `kb-ingest.ts:64-90` |
| 7 | skip-and-continue: failures logged to `kb-urls/.failed/<lib>.txt`; retry with `--retry-failed` | `kb-ingest.ts:215-225,:242-245` |
| 8 | cost guards: `--max-pages` clean stop `:155-158`; end-of-run summary (scrapes ≈ Firecrawl credits, tokens) `:228-241` | — |

## C. Key decisions & WHY
- **Chunk-size tradeoff** (`chunking.ts:3` default `500/50`; video `VIDEO_CHUNK_SIZE=500`, `OVERLAP_WORDS=10`, `ai.constant.ts:21-23`) — small chunks = sharper similarity + more rows + risk of cutting context; large chunks = more context per hit but blurrier embeddings and fewer distinct matches. 500 chars with 50-char (or 10-word) overlap keeps cross-chunk continuity without bloating row count.
- **Why `embedMany` in batches** (`embeddings.ts:41-62`, `BATCH_SIZE=50`, `DELAY_MS=1000`) — one big document can exceed Gemini's per-minute request budget; batches of 50 with a 1s pause (skipped after the last batch, `:59`) "keeps a single document under Gemini RPM" (`ai.constant.ts:9`).
- **Greedy timestamp chunker** (`video-chunker.ts:26`) — accumulates words to ~`chunkSize` chars, carries `overlapWords` forward; `i` always advances ≥1 so an oversized overlap can't infinite-loop (`:18-25` comment). Preserves `start/endSeconds` per chunk for citations.
- **Delete-before-insert (URL/video), append (PDF)** — URL & video re-ingest overwrites by `metadata->>document_id` (`ingest-url.action.ts:76`, `ingest-video.action.ts:81`) so re-running is idempotent. PDF currently appends (no delete) — **inconsistency, flagged** (re-uploading the same PDF duplicates chunks).
- **`language_code:"ar"` is deterministic** (`assemblyai-transcribe.service.ts:52`; rationale comment `:48-49`) — auto-detection misfires on heavy English code-switching; hard-coding Arabic is the lecture reality.
- **Owner-only** — ingestion uses `createAdminClient()` (bypasses RLS), so every action gates on `isOwner` (Flow 5), not just login. The scripts skip `isOwner` because their trust boundary is possession of `.env.local` itself.
- **Two `document_id` keying schemes — never mix them** (`url-normalize.ts:1-25`). The UI url path keys on Firecrawl's resolved `sourceURL` (`ingest-url.action.ts:89` — drifts on redirects/trailing slashes); the scripts key on the **normalized input URL** (`kb-ingest.ts:148`, `normalizeUrl` at `url-normalize.ts:26`: drop fragment+query, strip trailing slash, lowercase scheme/host, pathname case untouched). Ingesting the same page through *both* paths lands it under two ids → duplicate chunks (`url-normalize.ts:10-13`). Pick one path per source.
- **Human review between map and ingest** (`kb-map.ts:1-12`) — discovery is free; scraping+embedding costs credits and pollutes the KB if the URL list is junk. The `.txt` file *is* the approval artifact.
- **Resume + skip-and-continue** (`kb-ingest.ts:10-18` docstring) — a 200-URL run WILL drop mid-way (rate limits, network). Checkpointing per-URL (atomic tmp+rename, `:81-89`) makes re-runs cheap; failures go to a retry file instead of aborting the batch.
- **One-focused-doc-per-topic for curated content** — `kb-docs/` is per-component/per-sprint files, each its own `document_id` via `kb:ingest-doc`. Why: sharper chunk embeddings + meaningful panel labels + clean per-topic overwrites (CONCEPTS.md §2).

## D. Data shapes
- `knowledge_base` row: `{ content, embedding: number[768], metadata: jsonb }`.
- **`metadata` per `source_type`:** PDF → `{ document_id:file.name, embedding_usage, provider_metadata }` (no `source_type`); URL (UI) → `{ document_id:sourceUrl, source_type:"url", title, … }`; URL (script) → same but `document_id` = normalized input url (`kb-ingest.ts:179-189`); video → `{ document_id:video_title, source_type:"video", video_title, start_seconds, end_seconds, drive_url?, … }`; doc (script) → `{ document_id:caller-supplied, source_type:"doc", title:basename }` — intentionally minimal, no usage blobs (`kb-ingest-doc.ts:84-88`).
- `ScrapedPage { markdown, sourceUrl, title? }` — `firecrawl.service.ts:5`.
- `TranscribedWord { text, start, end }` (ms) → `TimestampedChunk { content, startSeconds, endSeconds }` — `video-chunker.ts:3`.

## E. Rebuild-from-blank (mechanism only)
1. Server action: auth + owner gate → reject early.
2. Extract text (PDF parser / scraper / transcriber).
3. `chunkText` (recursive splitter, size+overlap).
4. `embedMany` in batches with a pause between batches.
5. `insert` `{ content, embedding, metadata }[]` via the admin client.
6. For re-ingestable sources, `delete where metadata->>document_id = X` first.

## F. Active-recall exercise (~45 min)
Close the files. Write `generateEmbeddingsMany` from memory — the batch loop, accumulation of embeddings/warnings/tokens, and the "sleep only if more batches remain" condition. Then write `chunkTranscriptWithTimestamps`'s inner while-loop and the `i = Math.max(i+1, j-overlapWords)` advance. Then, from memory: the 5 paths → which keying scheme each uses for `document_id`, and which overwrite. Diff against `embeddings.ts` + `video-chunker.ts` + §B/§B2.

## G. Pitfalls
- **Forgetting the delete-overwrite** on re-ingest duplicates chunks (the PDF path already has this bug — note it).
- **Ingesting the same page via UI + script** → two `document_id`s → duplicates the delete-overwrite can't fix (`url-normalize.ts:10-13`).
- **Insert-after-delete failure = data loss window** — the gap is non-transactional; the scripts build records first and scream `!!! DATA LOSS … Re-run to restore` (`kb-ingest.ts:202-208`, `kb-ingest-doc.ts:106-110`). Re-run restores because embeddings are recomputed from source.
- **Trusting `limit` as scope** — Firecrawl `/map`'s `limit` is a safety cap that silently drops pages; scope comes from `includePaths` (`firecrawl.service.ts:107-108`, `sites.config.ts` header).
- **Overlap ≥ chunk size** would loop forever without the `Math.max(i+1, …)` guard (`video-chunker.ts:56`).
- **No batch delay** trips Gemini RPM on large docs; the 1s pause is load-bearing.
- **Upload body size** — Server Actions are capped at `bodySizeLimit:"50mb"` (`next.config.ts:11`); a larger lecture file is rejected before your code runs.
- **Embedding the wrong field** — video embeds `chunk.content` (text), not the timestamped object (`ingest-video.action.ts:76`).
