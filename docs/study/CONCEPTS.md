# CONCEPTS — transferable ideas behind this repo

> The theory you must own **independent of this codebase** — these are the calls you'll make yourself next time. Each: what it is (3–4 sentences) → why THIS project chose what it chose, cited. Code wins; doc-sourced rationale is labeled.

---

## 1. Vector embeddings & cosine similarity

An embedding model maps text to a fixed-length vector such that texts with similar *meaning* land close together — closeness measured as the angle between vectors, not shared words. Cosine similarity is the normalized dot product: 1 = same direction, 0 = unrelated; pgvector's `<=>` operator returns cosine *distance*, so `similarity = 1 - distance`. Semantic search is then: embed the query with the **same model and dimension count** as the stored chunks, and rank stored vectors by that distance. More dimensions preserve more nuance but cost storage and index performance; a similarity *threshold* converts "nearest" into "near enough to trust."

**Here:** `gemini-embedding-001` is natively 3072-dim but is requested at **768** via `providerOptions.google.outputDimensionality` (`embeddings.ts:13,:22`) to match the `vector(768)` column — *rationale-from-docs:* "768 dims balances quality vs index size" (`PROJECT_DEEP_DIVE.md:1218`), and it shares the chat model's Google key (one vendor, one bill). Newlines are flattened before embedding (`embeddings.ts:16`) — whitespace noise shifts vectors. The trust floor is `RAG_SIMILARITY_THRESHOLD: 0.6` (`ai.constant.ts:6`), clamped defensively at the search wrapper (`search.ts:23-24`).

## 2. Chunking strategy — and why focused docs beat mega-docs

An embedding is the *average meaning* of everything in the chunk: a chunk about one thing yields a sharp, matchable vector; a chunk straddling two topics yields a mushy one that matches neither well. Small chunks sharpen matching but amputate context; overlap re-stitches continuity across cuts. The lever *above* chunk size is **document shape**: many small one-topic files mean every chunk the splitter produces inherits exactly one topic, while a mega-doc forces topic-blend chunks at every internal boundary. One-topic files also give you stable per-topic `document_id`s — which makes overwrite-on-reingest and human-readable source labels possible.

**Here:** `chunkText` defaults to **500 chars / 50 overlap** splitting on spaces (`chunking.ts:3-11`); the video chunker keeps the same budget but in words with 10-word overlap so it can carry timestamps (`video-chunker.ts:26`, `ai.constant.ts:21-23`). The curated KB is deliberately one-focused-file-per-topic — `kb-docs/rose-app-component-button.md`, `rose-app-design-tokens.md`, per-sprint files — each ingested under its own `document_id` via `yarn kb:ingest-doc` (`kb-ingest-doc.ts:81-89`), so a question about the Button task retrieves *only* Button chunks, and the insights panel can name the source meaningfully (`rag.ts:63,:74`).

## 3. HNSW indexing — and why ORDER BY must use the raw operator

HNSW is an approximate-nearest-neighbor graph index: it answers "give me the k closest vectors" in ~log time instead of scanning every row. The catch is *planner-shaped*: Postgres can only use the index when the query is literally `ORDER BY column <=> $query ASC LIMIT k` — the index scan emits rows in ascending distance order, so that exact shape is what it can serve. Wrap the operator in arithmetic (`ORDER BY 1 - (col <=> q) DESC`) or sort by a computed alias, and the planner no longer recognizes the pattern → sequential scan over the whole table. The rule: **compute `similarity` in the SELECT list for humans; order by the raw operator for the index.**

**Here:** the RPC body is owner-run in Supabase, not in the repo — its observable contract (called at `search.ts:29`, recorded at `PROJECT_DEEP_DIVE.md:1099-1102`) and the reconstructed SQL in `REBUILD-RUNBOOK.md` §2 encode exactly this rule, including the `WHERE 1 - (… <=> …) >= threshold` filter which is fine (filters don't break index-ordered scans the way ORDER BY rewrites do). Verify with `EXPLAIN` — an index scan on the HNSW index, not Seq Scan.

## 4. Eager RAG vs tool-based retrieval

**Eager**: retrieve on *every* turn before generation and inject results into the system prompt — the model never decides. **Tool-based**: expose search as a tool; the model chooses when/what/how often to search, enabling multi-hop lookups at the price of unbounded calls, added latency per round-trip, and a cost ceiling you can't prove. Eager gives you exactly-one embed + exactly-one DB query per turn, results known *before* streaming starts, and a dumber-but-predictable system; its waste case is retrieving for turns that didn't need it ("thanks!").

**Here:** eager — `buildRagSystemPrompt(trimmed)` runs before `streamText` (`route.ts:70-71` → `:79`), which is also why RAG sources can ride the **first** metadata emit and mount the insights panel instantly (`route.ts:122-127`). The cost ceiling is provable: 1 embed + 1 RPC + ≤2 generations (`stopWhen: stepCountIs(2)` `route.ts:86`; *rationale-from-docs* `PRE_DEPLOY_AUDIT.md:49-59`). **Nuance the audit predates:** the query-rewrite adds one small bounded LLM call per multi-turn (`query-rewrite.ts:39-55`, capped at 100 output tokens `:15,:43`; skipped on the first message `:36`). The one tool the model *does* control is `browser_search` grounding — the out-of-KB web path, never the KB path (`providers.ts:38-41`).

## 5. Cross-lingual retrieval

A multilingual embedding model maps *meaning* into a shared space, so an Arabic query lands near English chunks about the same concept — you can serve an Arabic-first audience over a mostly-English KB with no translation layer. Two prompt-level rules keep languages from bleeding: the search query is rewritten **in the user's language, never translated** (translation would be a second lossy hop before embedding), and the **reply language is decided by the user's latest message, never by the context language**. And because cross-lingual similarity scores run systematically lower than same-language ones, you must *measure* the two populations separately before trusting one threshold for both.

**Here:** rewrite rule at `prompts.ts:375` ("SAME LANGUAGE … Do not translate"); reply-language rule stated twice — persona `prompts.ts:60` and again *overriding the pull of retrieved context* at `:331`. The measurement exists: `yarn kb:eval` reports **EN vs AR pass rates and average top-similarity separately** (`kb-retrieval-eval.ts:87-95`) over a golden set tagged by `lang` (`kb-eval-questions.json`) — the AR aggregate is the one to watch when tuning the 0.6 floor. Arabic lecture audio is transcribed with a hard-coded `language_code:"ar"` (`assemblyai-transcribe.service.ts:52`) because auto-detect misfires on heavy English code-switching.

## 6. Grounding & refusal design

Split the assistant's knowledge into **domains with different truth sources** and encode the policy per domain: (a) general technical knowledge — model memory is fine, web search allowed for version-sensitive facts; (b) institution facts — *only* the curated KB is truth; on a gap, admit it and route to a named human, because a confident wrong answer about grading/deadlines does real harm; (c) off-topic — refuse warmly, never answer even partially. The subtle failure this prevents: web search silently masquerading as institutional truth ("Elevate's policy is…" sourced from a random blog).

**Here:** the two-domain rule at `prompts.ts:333-334` with the per-case decision list `:349-353`; web-as-Elevate-truth explicitly banned in the tool tree (`prompts.ts:81`) and again in context-usage (`:351`). Off-topic is an ABSOLUTE rule with worked examples (`prompts.ts:36-45`). Gaps escalate to named humans — Eng. Shams / Eng. Abdelrahman (`prompts.ts:104-111`) — with bilingual gap templates (`:336-338`). Even the identity anchor is refusal design: bare "Elevate" always means Elevate Tech, never web-disambiguated (`prompts.ts:8`).

## 7. Keeping debug signals out of model-facing context

Anything you put in the prompt is something the model may quote back to the user — similarity scores, chunk ranks, "Result 1:" labels, and reasoning traces are *telemetry*, not content. The discipline: telemetry flows through a **separate UI-facing channel** (message metadata) while the prompt carries only clean content; and suppression is layered — turn the signal off at generation *and* strip it at the transport, because either layer alone can regress. A model that says "with 0.83 similarity, the Button task…" instantly breaks the mentor illusion.

**Here:** the similarity score is *deliberately commented out* of the chunk XML (`rag.ts:101`) — scores flow only to panel sources (`rag.ts:76,:84` → `chat.d.ts:48`). Reasoning is zeroed at generation (`thinkingBudget:0`, `providers.ts:76`) **and** blocked at the wire (`sendReasoning:false`, `route.ts:117` — the belt-and-braces comment `:114-116`). The prompt bans scaffolding leakage twice: voice rule `prompts.ts:58`, retrieval rule `:354`.

---

## Bonus — four more calls worth stealing

- **Fail-closed vs fail-open, chosen per consequence.** The rate-limit *check* fails closed (unknown spend → deny, `rate-limit.ts:32-34`); the request *log* fails open (lost telemetry must not block chat, `:51-64`). Ask of every failure path: which direction is the cheap mistake?
- **Idempotent ingestion = delete-then-insert on a stable key.** Re-runs replace instead of duplicate (`ingest-url.action.ts:76`, `kb-ingest-doc.ts:94`). The gap is non-transactional, so: build ALL records *before* deleting (`kb-ingest.ts:176-178`) and log DATA LOSS loudly if the insert then fails (`kb-ingest.ts:202-208`). And the key must be deterministic — `normalizeUrl` exists because Firecrawl's resolved URL drifts (`url-normalize.ts:1-25`); the same page must never be ingested via both keying schemes (`:10-13`).
- **No silent fallback.** `getActiveChatProvider` throws (`providers.ts:112-120`), `maxRetries:0` (`route.ts:85`). A fallback would hide outages behind degraded answers; failing loud is a feature when one person operates the system.
- **Golden-question eval with controls.** A retrieval eval needs *should-miss* questions, not just should-hit ones — `type:"control"` rows flag `BAD-CONTROL` when an off-KB question clears the threshold (`kb-retrieval-eval.ts:8,:59-66`), catching a too-low threshold that pure recall metrics reward. Cheap (a JSON file + one script), and it turns threshold-tuning from vibes into a scoreboard.
