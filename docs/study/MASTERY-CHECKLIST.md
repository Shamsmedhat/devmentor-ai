# MASTERY CHECKLIST

> Without looking at the code, can you…? Tick only when you can do it cold. Each maps to a flow or the runbook.

## Flow 1 — Chat lifecycle
- [ ] List the `POST /api/chat` steps in order: guard → parse → provider → normalize → memory → RAG → convert → log → streamText.
- [ ] Wire `streamText` + `toUIMessageStreamResponse` with progressive `messageMetadata` (4 branches: start / source / finish-step / finish).
- [ ] Explain why the user msg is persisted at send time but the assistant msg in `onFinish`.
- [ ] Explain why the new-session URL is set via `history.replaceState`, not a navigation.
- [ ] State why `stopWhen: stepCountIs(2)` and `maxRetries:0`.

## Flow 2 — RAG retrieval
- [ ] Explain why 768 dims, not the native 3072.
- [ ] Write the `search_knowledge_base` RPC with the correct `ORDER BY embedding <=> query` (raw, ascending) and `similarity = 1 - (… <=> …)` in SELECT.
- [ ] Explain graceful degradation vs erroring, and name the three fall-back branches.
- [ ] State why the model never sees similarity scores.
- [ ] Explain what query-rewrite does and what it must NOT affect (reply language / the message sent to the model).

## Flow 3 — Ingestion
- [ ] Explain the chunk-size tradeoff (small vs large) and the chosen 500/50.
- [ ] Write `generateEmbeddingsMany`'s batch loop incl. the "sleep only if more batches remain" condition.
- [ ] Write the video chunker's advance `i = Math.max(i+1, j-overlapWords)` and say why.
- [ ] Name the metadata differences across all 5 paths (PDF / URL-UI / URL-script / video / doc) and which paths delete-overwrite.
- [ ] Explain the two `document_id` keying schemes (Firecrawl `sourceURL` vs `normalizeUrl(input)`) and why the same page must never go through both.
- [ ] Describe the bulk-crawl hardening: human review gate, resume checkpoint (atomic tmp+rename), `--retry-failed`, `--max-pages`, and the DATA-LOSS window (why records are built before delete+insert).
- [ ] Say why the scripts have no `isOwner` check but the actions do.

## Flow 4 — Providers
- [ ] Reconstruct `CHAT_PROVIDERS` (3 entries) + `getActiveChatProvider` (throws, no fallback).
- [ ] Explain why gpt-oss needs `structuredOutputs:false` and why Gemini gets `thinkingBudget:0`.
- [ ] Explain why `googleSearch({})` takes no `apiKey`.

## Flow 5 — Auth & guards
- [ ] Name the three guards and the surface each protects (pages / API / ingestion).
- [ ] Set up Supabase SSR auth + the OAuth callback (`exchangeCodeForSession`).
- [ ] Explain `getUser()` vs `getSession()` and why the owner gate fails closed.
- [ ] Explain why ingestion is gated in middleware AND inside each action.

## Flow 6 — Cross-cutting
- [ ] Write `checkChatRateLimit` + `logChatRequest` with the fail-closed-check / fail-open-log asymmetry.
- [ ] Explain why per-user, not per-IP (CGNAT).
- [ ] Write `slidingWindowWithAnchor` and say why `messages[0]` is anchored.
- [ ] State where `<html dir>` comes from vs where the chat reply direction comes from.

## KB ops & eval
- [ ] Write the eval flag matrix from memory: covered×hit / covered×miss / control×hit / control×miss → PASS / REVIEW / BAD-CONTROL / GOOD-CONTROL.
- [ ] Name the 4 integrity checks (`kb:integrity`) and the failure each catches.
- [ ] Explain why the eval aggregates EN and AR separately.
- [ ] Explain why one-focused-doc-per-topic beats a mega-doc, in embedding terms.

## Concepts (transferable — answer with zero repo references)
- [ ] Argue eager RAG vs tool-based retrieval: cost ceiling, latency, sources-before-stream, and when you'd pick the other one.
- [ ] State the two prompt rules that make cross-lingual retrieval safe (rewrite language, reply language).
- [ ] State the institution-facts vs general-knowledge policy and why web search must never fill an institutional gap.
- [ ] Explain why similarity scores stay out of the prompt but flow to the UI, and name the two layers that keep reasoning off the wire.

## Runbook
- [ ] Order the build steps (1→12 incl. 8b, 11b) so each runs before the next, from blank repo to working chat.
- [ ] From memory, write the full `knowledge_base` table + HNSW index + RPC.
- [ ] List the 8 live env vars — and name the dead ones in `.env.example` that a rebuild must NOT copy.
- [ ] Name exactly which files change in the FINAL "swap the domain" step (all five surfaces) — and which stay.
