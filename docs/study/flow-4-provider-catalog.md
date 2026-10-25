# Flow 4 — Provider catalog

> Day 4. One file decides which model runs, what it can accept, and how it streams.

## A. Purpose
A swappable catalog of chat providers (Gemini, Groq×2) with per-model tools, capabilities, and stream options — so the route stays provider-agnostic and switching models is a one-line edit.

## B. The trace
| # | Hop | File:line | Note |
|---|---|---|---|
| 1 | `CHAT_PROVIDERS` array — 3 entries | `providers.ts:83-108` | gpt-oss-20b, llama-3.3-70b, gemini-2.5-flash |
| 2 | `ACTIVE_CHAT_PROVIDER_ID = "google:gemini-2.5-flash"` | `providers.ts:110` | the single switch |
| 3 | `getActiveChatProvider()` finds it or **throws** | `providers.ts:112-120` | no fallback |
| 4 | Route calls `provider.createModel()` / `.createTools()` / spreads `.streamOptions` | `route.ts:80-87` | provider-agnostic |
| 5 | Route checks `provider.apiKeyEnv` present → else 503 | `route.ts:49-53` | fail loud |

## C. Key decisions & WHY
- **No silent fallback** (`providers.ts:10-12` comment, `getActiveChatProvider` throws `:114`, `maxRetries:0` in `route.ts:85`) — "If the active provider fails, the request fails and we see it instead of silently retrying." Fallback would mask outages and double-bill on the same key.
- **Per-provider `streamOptions`** keep the route clean:
  - Groq gpt-oss: `structuredOutputs:false` + `reasoningEffort:"low"` (`providers.ts:60-67`) — Groq's `browser_search` is incompatible with structured outputs; leaving it on drops native tools → validation error. `reasoningEffort` is gpt-oss-only (Llama rejects it).
  - Gemini: `thinkingConfig:{ thinkingBudget:0, includeThoughts:false }` (`providers.ts:72-81`) — zeros the thinking block so reasoning never streams (paired with `sendReasoning:false` in the route).
- **Per-provider `capabilities`** (`providers.ts:45-53`) — `geminiMultimodal` accepts image+file parts; `groqTextOnly` accepts neither. The route reshapes attachments against this profile *before* `convertToModelMessages` (Flow 1 hop 8).
- **`googleSearch({})` grounding** (`providers.ts:38-41`) — empty object on purpose; passing `apiKey` returns a 400 (`Unknown name "apiKey"`). Grounding auths via `GOOGLE_GENERATIVE_AI_API_KEY`. *Rationale-from-docs:* `PRE_DEPLOY_AUDIT.md:32`. Free under ~1,500 queries/day on Flash, then $35/1k — *rationale-from-docs*, `PRE_DEPLOY_AUDIT.md:57`.
- **Catalog-first rule** (CLAUDE.md) — add the entry to `CHAT_PROVIDERS` *before* pointing `ACTIVE_CHAT_PROVIDER_ID` at it.

## D. Data shapes
- `ChatProvider { id, apiKeyEnv, capabilities, createModel(), createTools(), streamOptions }` — `providers.ts:24-31`.
- `ModelAttachmentCapabilities { supportsImageFileParts, supportsNonImageFileParts }` — `model-capabilities.ts:9`.
- `ChatProviderStreamOptions = Pick<streamText params, "providerOptions">` — `providers.ts:19`.
- Tools factories: `groqBrowserTools` (`:33`), `googleSearchTools` (`:38`), `emptyTools` (`:43`).

## E. Rebuild-from-blank (mechanism only)
1. Define a `Provider` type carrying `createModel`, `createTools`, `streamOptions`, `capabilities`, `apiKeyEnv`.
2. Put each model in a `PROVIDERS` array; export one `ACTIVE_ID` constant.
3. `getActive()` = `find(id===ACTIVE_ID)` and **throw** if absent.
4. Route spreads `provider.streamOptions` into `streamText` and reads `createModel()/createTools()` — never names a model directly.

## F. Active-recall exercise (~30 min)
Close the file. Reconstruct `CHAT_PROVIDERS` (3 entries) + `getActiveChatProvider` from memory, including which provider gets which `streamOptions` and *why* gpt-oss needs `structuredOutputs:false`. Diff against `providers.ts`. Score: did `getActive` throw (not fall back)? did you set `thinkingBudget:0` only on Gemini?

## G. Pitfalls
- **Pointing `ACTIVE_CHAT_PROVIDER_ID` at an id not in the array** → throws at request time (by design, `:114`).
- **Leaving `structuredOutputs` default-true on Groq gpt-oss** with `browser_search` → request validation error.
- **Passing `apiKey` to `googleSearch`** → 400. Use `googleSearch({})`.
- **Adding a model and forgetting its `capabilities`** → attachments may be sent to a text-only model and rejected.
- **Assuming fallback exists** — it doesn't; monitor the active provider's health yourself.
