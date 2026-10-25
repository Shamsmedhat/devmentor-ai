# Session notes — 15 Oct 2026: KB restructure

What changed in this session, why, and what is still open. The knowledge base is now **project-only** (Rose App sprints, design system, team rules). Library docs and lecture transcripts are no longer in the database. Chat uses **Gemini 3.5 Flash-Lite**.

## 1. Database before the change

The Supabase project (`devmentor-ai`, Free plan, 500 MB) was about **394 MB (~79%)**. Storage buckets were empty. Almost all of that was `knowledge_base`:

| Part | Size |
|---|---|
| Table total | 381 MB |
| Text content | ~16 MB |
| Embeddings (TOAST) | ~133 MB |
| Indexes | ~221 MB |

Two vector indexes sat on the same `embedding` column:

- `knowledge_base_embedding_idx` — IVFFlat, 132 MB, unused by real traffic
- `knowledge_base_embedding_hnsw` — HNSW, 88 MB, the one chat actually used

33,354 chunks / 891 documents. By `source_type`:

| source_type | Documents | Chunks |
|---|---|---|
| url (crawled docs) | 764 | 29,440 |
| video (transcripts) | 106 | 3,880 |
| elevate (design system) | 14 | 20 |
| jira | 6 | 6 |
| untagged PDF (`ضوابط الفِرَق.pdf`) | 1 | 8 |

About **12k chunks (~36%) were exact duplicates** of site chrome: TanStack inline SVG (~81% of that site) and shadcn sidebar nav (~52%). Four extra pages were the same URL ingested again with a `#hash`.

## 2. Why the sprint answers were bad

Two chats, same session (`google:gemini-2.5-flash`):

1. **"طيب اية السبرنت الاول ؟"** — generic invented sprint (Next.js setup, mock JSON, `index.js`).
2. **"ازاي اعمل ال Dropdown..."** — correct task, but ~4,800 characters, formal Arabic, headings, and a hand-rolled `useEffect` keyboard handler instead of starting from shadcn.

Language was not the main bug. Measured exact similarity of the Rose App docs vs the index:

| Query | Exact best Rose doc | What the HNSW index returned as #1 |
|---|---|---|
| السبرنت الاول في Rose App | 0.725 `rose-app-overview` | 0.641 unrelated video |
| Sprint 1 in Rose App | 0.709 overview | 0.589 react.dev |
| the first sprint at Elevate | 0.630 overview | 0.578 typescriptlang |
| تعرف اية عن السبرنتات في ايليفيت | 0.570 (below 0.6 cutoff) | TanStack junk |

Two separate failures:

- **The index skipped real docs.** ~12k identical junk vectors plus default `hnsw.ef_search` (40) crowded out the 23 Rose App chunks.
- **"ايليفيت" in Arabic** does not match the Latin "Elevate" in the KB. Best exact score was 0.57, under the old 0.6 cutoff, so retrieval returned nothing.

When retrieval returned 0 chunks, `rag.ts` fell back to `MENTOR_SYSTEM_PROMPT` only. That prompt has no "say it is not in the KB" rule, so the model web-searched and invented a sprint. Stored `chat_messages.metadata` showed empty `rag` and grounding queries `Elevate Tech Rose App Sprint 1 tasks`.

The Dropdown answer retrieved the right story (`nra-sprint-1-combobox-select-menu` at 0.75). Length came from `<answering_task_questions>`: it asked for a worked example per criterion, with no length or dialect cap. Ten chunks were sent, including three unrelated Git videos.

## 3. Content decisions

- **Crawled docs (url):** removed. Stable concepts the model already knows. Version-specific APIs (Next 16, Tailwind v4) go stale; Google Search is already wired and is more current. On Gemini 2.5, grounding is 1,500 prompts/day free, then $35 / 1,000. On Gemini 3.x it is 5,000 searches/month free, then $14 / 1,000 queries.
- **Video transcripts:** removed. One cycle (June 2026), no `drive_url` on any chunk, noisy ASR. A later catalog will be title + short summary + Drive link, not a full transcript.
- **Kept:** sprint stories, Rose App design docs, team-rules PDF. That is the only material the model cannot get from the web.
- **Ingestion code stays** (crawl scripts, URL form, video transcription). Unused, not deleted.
- **Old `kb-docs/sprint-1-*.md` files stay** on disk. They are not in the database. Do not re-ingest them; they contradict the new Jira stories.

## 4. Jira stories added

Exported CSV converted to one file per story (same shape as the existing sprint docs) and ingested as one chunk each, `source_type: jira`:

| File | document_id | Jira |
|---|---|---|
| `kb-docs/nra-sprint-1-project-setup.md` | `nra-sprint-1-project-setup` | NRA-1 |
| `kb-docs/nra-sprint-1-input.md` | `nra-sprint-1-input` | NRA-3 |
| `kb-docs/nra-sprint-1-combobox-select-menu.md` | `nra-sprint-1-combobox-select-menu` | NRA-6 |

The six older Jira chunks (`sprint-1-repo-setup`, `sprint-1-design-system`, `sprint-1-input`, `sprint-1-button-checkbox-badge`, `sprint-1-select-combobox-textarea`, `sprint-1-toast-tabs-pagination-breadcrumbs`) were deleted before this ingest.

**Not in the export:** NRA-4 (Buttons, Checkbox, Badge) and NRA-5 (Pagination, Toast, Tabs, Textarea) had empty descriptions. NRA-2 is the epic, referenced as the parent, not its own file.

Re-ingest one story (keeps it as a single chunk):

```bash
yarn kb:ingest-doc kb-docs/nra-sprint-1-input.md nra-sprint-1-input --source-type jira --chunk-size 6000
```

## 5. What the KB is now

`delete` of every `url` and `video` row. **31 chunks left:**

- 20 `elevate` (design system)
- 3 `jira` (the NRA stories above)
- 8 untagged (`ضوابط الفِرَق.pdf`)

Both vector indexes were dropped. At this size an exact scan is a few milliseconds and does not miss rows. Add HNSW back only if the table grows past about 10k rows.

Backup (gitignored, `kb-backup/` was already in `.gitignore`):

- `kb-backup/video-transcripts/<title>.txt` — 106 files, chunks in timestamp order
- `kb-backup/url-docs.jsonl` — crawled pages, no embeddings

Internal Figma "rate limit" notes were removed from the select, combobox, pagination, and breadcrumbs docs (they were leaking into answers). Those four rows in the DB no longer contain the note.

**Size:** 394 MB → **175 MB** after the deletes and index drops. `VACUUM FULL` cannot run through the SQL API (it refuses to run inside a transaction). Run this once in the Supabase SQL editor to reclaim the rest:

```sql
vacuum full public.knowledge_base;
```

Expected size after that: a few MB.

## 6. Retrieval and prompt changes

Files: `src/lib/ai/prompts.ts`, `query-rewrite.ts`, `rag.ts`, `src/lib/constants/ai.constant.ts`.

- **Query rewriter** always runs, including the first message. "ايليفيت" / الأكاديمية / البوتكامب / الدبلومة map to Elevate Tech and Rose App. A sprint or task with no project name gets "Rose App" and a digit ("سبرنت 1"). General React / Next questions are left alone. Three extra examples were added. Thinking options come from the active provider, not a hardcoded Gemini 2.5 `thinkingBudget`.
- **Zero matches** still use `RAG_SYSTEM_PROMPT(NO_KB_MATCH_NOTE)`, so the "this is not in the KB, escalate" rules apply. A search error still falls back to the plain mentor prompt.
- **Voice:** Arabic replies in Egyptian colloquial; most replies 80–200 words; no headings in chat.
- **Task answers:** 1–2 sentences, then `**المطلوب:**` (at most 5 merged bullets), then `**تبدأ ازاي:**` (3–4 steps starting from shadcn/ui, at most one snippet), then one closing line. About 150–250 words.
- **Tools:** never `browser_search` for Elevate or Rose App sprint/task content. Do search for version-specific library questions, because those docs are no longer in the KB.
- **Sessions:** a `session` chunk is recommended with its title and Link. The old "cite every video timestamp" rule is gone. `rag.ts` emits `<chunk type="session">` for `source_type = session`. The model must not echo `document_id` values back to the student.
- `RAG_MAX_RESULTS`: 10 → **6**.
- `RAG_SIMILARITY_THRESHOLD`: **0.60** (was 0.58, briefly). Covered questions scored at least 0.640; general controls at most 0.559.

## 7. Embedding model

Compared in memory (no DB writes) on the 31 chunks and the golden set:

| Candidate | Expected-doc hits | Gap (min covered − max control) | Controls above 0.60 |
|---|---|---|---|
| A. `gemini-embedding-001` plain | 23/23 | 0.082 | 0/8 |
| B. `001` + `RETRIEVAL_DOCUMENT` / `RETRIEVAL_QUERY` | 23/23 | 0.057 | 0/8 (1/8 at 0.58) |
| C. `gemini-embedding-2` + task prefixes ($0.20/1M) | 22/23 (missed the rules PDF) | 0.036 | 3/8 |

**Kept A.** Same model as before, no re-embed required. `src/lib/ai/embeddings.ts` now names the model in one constant.

`scripts/kb-reembed.ts` and `yarn kb:reembed` rewrite every stored embedding in place. Use it only after changing the embedding model. Old and new vectors cannot be mixed.

## 8. Chat model

`ACTIVE_CHAT_PROVIDER_ID` is **`google:gemini-3.5-flash-lite`**. Same price as 2.5 Flash ($0.30 input / $2.50 output per 1M tokens). Catalog entry uses `thinkingLevel: "minimal"`.

Trial on the same six questions (2.5 Flash vs 3.5 Flash-Lite):

| | 2.5 Flash | 3.5 Flash-Lite |
|---|---|---|
| Sprint overview | ~70 words, correct | ~59 words, also included the weekly schedule |
| Sprint 1 | ~160 words, setup only | ~190 words, setup + the component tasks |
| Dropdown | ~200 words, good | ~170 words, good, starts from shadcn |
| Sprint 3 | honest gap, no web search | same |
| useEffect cleanup | ~300 words, and it web-searched | ~150 words, no search, one example |
| Tailwind v4 theme | wrong (`@tailwind` + `dark:` class, no search) | correct (`@theme`, CSS-first) and it searched |

Restart `yarn dev` after this change so the new model is picked up.

2.5 Flash stays in the catalog. Google has not published a shutdown date for it, but new projects are steered to 3.5 Flash-Lite or 3.8 Flash.

## 9. Eval

`scripts/kb-eval-questions.json` is a project golden set: 23 covered questions (AR + EN) with an `expected` document id, and 8 general React / Next / JS / Git controls that must not match.

`yarn kb:eval` runs each question through the rewriter, then search:

- EN covered: **9/9**
- AR covered: **14/14**
- Controls rejected: **8/8**
- Average top similarity: EN 0.733, AR 0.770

`yarn tsc --noEmit` passed. ESLint on the touched AI files passed. `src/components/ui/carousel.tsx` still has a pre-existing `set-state-in-effect` lint; that file was not part of this work.

Chat checks against the new model (not the live UI):

- The three original questions retrieve Rose App docs and answer from them. No web search.
- "ايه تاسكات سبرنت 3؟" says Sprint 3 is not in the KB and points at Jira / the diploma lead. No web search.
- "ازاي اعمل cleanup في useEffect؟" has no KB hit and is answered from the model.
- "what's new in Tailwind CSS v4 theming" triggers Google Search.

## 10. Session catalog (not filled yet)

Template only. Files starting with `_` are not ingested.

- `kb-docs/sessions/_TEMPLATE.md` — title, module, cycle, date, instructor, Drive link, 3–5 line summary, keywords, related Rose App tasks
- `kb-docs/sessions/_VIDEOS.md` — checklist of the 106 June titles, grouped by series

When a session file is ready:

```bash
yarn kb:ingest-doc kb-docs/sessions/<file>.md session-<cycle>-<slug> --source-type session
```

Use `kb-backup/video-transcripts/<title>.txt` as raw material for the summary. Update the Drive link and date per cycle; the summary can stay if the syllabus does not change.

## 11. Still open

- Run `vacuum full public.knowledge_base;` in the Supabase SQL editor.
- Write NRA-4 and NRA-5 in Jira, then convert and ingest them the same way.
- Fill the session catalog.
- `rose-app-overview.md` still says every sprint has 6 stories. NRA Sprint 1 currently has 5 stories plus the epic.
- Crawl / URL / video ingestion code is dormant. Delete it later if it stays unused.
- Do not ingest the old `kb-docs/sprint-1-*.md` files.
