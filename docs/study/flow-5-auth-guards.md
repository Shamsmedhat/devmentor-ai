# Flow 5 — Auth & guards

> Day 5. **Three distinct guards** — don't conflate them (the 6-flow's idealized "route-guard.util.ts" assumed they were one).

## A. Purpose
Log users in via Google OAuth, keep the SSR session fresh, and gate three surfaces: protected routes, the chat API, and the owner-only upload surface.

## B. The trace — the three guards

**Guard 1 — middleware** (`proxy.ts`, Next 16 renamed `middleware`→`proxy`)
| # | Hop | File:line |
|---|---|---|
| 1 | `intlMiddleware(request)` handles locale | `:11,15` |
| 2 | `createServerClient` with cookie get/set bridge | `:17-35` |
| 3 | `supabase.auth.getUser()` (not `getSession`) | `:40` |
| 4 | **Owner gate:** `root==="upload" && !isOwner(user)` → redirect `/chat` | `:65` |
| 5 | Protected: `PROTECTED_ROUTES=["chat"]` + no user → redirect `/login?callbackUrl=…` | `:9,70-88` |
| 6 | Logged-in user hitting `/login` → redirect to sanitized `callbackUrl` | `:91-100` |
| 7 | `matcher` excludes `api`, `_next`, files | `:107` |

**Guard 2 — OAuth callback** (`api/auth/callback/route.ts`)
| # | Hop | File:line |
|---|---|---|
| 1 | `GET` reads `code` + `callbackUrl` | `:10-16` |
| 2 | `exchangeCodeForSession(code)` | `:43` |
| 3 | success → redirect sanitized `safeNextPath`; failure → `/login?error=auth_failed` | `:44-63` |

**Guard 3 — chat route guard** (`chat/route-guard.util.ts`)
| # | Hop | File:line |
|---|---|---|
| 1 | `guardChatRoute()` — Supabase env present? | `:15-29` |
| 2 | `getServerSupabaseAuth()` → 401 if no user | `:32-39` |
| 3 | `checkChatRateLimit(user.id)` → 429 / 503 | `:42-66` |
| 4 | returns `{ ok:true, user }` or `{ ok:false, response }` | `:7-8,68` |

## C. Key decisions & WHY
- **Three guards, three jobs** — middleware gates *pages*; `guardChatRoute` gates the *API* (it's not in the matcher, so the API auth must live in the handler); `isOwner` gates *ingestion*. The 6-flow assumed `route-guard.util.ts == require-owner.ts + proxy.ts`; in reality they're separate (`route-guard.util.ts:15` vs `require-owner.ts:9`).
- **`getUser()` not `getSession()`** (`auth-server-guard.ts:25`, `proxy.ts:40`) — `getUser` revalidates against Supabase; `getSession` trusts the cookie (project rule).
- **Owner gate fails closed** (`require-owner.ts:9-12`) — if `OWNER_EMAIL` is unset, *nobody* is owner. Enforced in **two places**: middleware page gate (`proxy.ts:65`) *and* each ingestion action (Flow 3), because actions can be called directly, bypassing the page.
- **Two server clients** — `server.ts:4` `createClient` (SSR, RLS-scoped, cookie-aware) vs `admin.ts:3` `createAdminClient` (service-role, bypasses RLS, `persistSession:false`). Admin is only for KB search + ingestion + rate-limit log.
- **`requireServerAuthUser` throws** (`auth-server-guard.ts:38`) — used in mutations that must hard-fail when anonymous; `getServerSupabaseAuth` returns `user:null` for callers that prefer a redirect.
- **Ownership re-checked at the page** (`chat/[[...sessionId]]/page.tsx:48-56`) — a session that isn't yours redirects to `/chat`, on top of RLS.

## D. Data shapes
- `guardChatRoute` → `{ ok:true; user:User } | { ok:false; response:Response }` (`route-guard.util.ts:7-8`).
- Over-limit 429 body reuses the stream-error envelope `{ kind:"rate-limit" }` so the client shows the rate-limit banner (`route-guard.util.ts:48-58`).
- RLS (*rationale-from-docs*, `PROJECT_DEEP_DIVE.md:1104-1115`): `chat_sessions`/`chat_messages` → `auth.uid() = user_id`; `chat_request_log` → RLS on, **no policies** (service-role only).

## E. Rebuild-from-blank (mechanism only)
1. `createServerClient` (SSR) with cookie get/setAll; `createBrowserClient` for the client.
2. Middleware/proxy: refresh session, redirect unauthenticated users off protected roots.
3. OAuth callback route: `exchangeCodeForSession(code)` → redirect to a *sanitized* next path.
4. Server-side `getUser()` helper; a `requireUser()` that throws.
5. Owner helper reading an env allowlist, fail-closed; call it in middleware *and* in every privileged action.
6. Separate admin (service-role) client for RLS-bypassing work only.

## F. Active-recall exercise (~30 min)
Close the files. Draw the request path for (a) anonymous user hitting `/ar/chat`, (b) owner hitting `/en/upload`, (c) a logged-in non-owner hitting `/en/upload`, (d) a `POST /api/chat` with no session. For each, name which guard fires and the resulting redirect/status. Diff against `proxy.ts` + `route-guard.util.ts`.

## G. Pitfalls
- **Putting `/api/*` in the matcher** would double-run auth and break streaming; the API auths itself via `guardChatRoute` instead (`proxy.ts:107`).
- **Using `getSession()`** trusts a forgeable cookie — always `getUser()`.
- **Gating ingestion only at the page** — actions are directly callable; the owner check must also be *inside* the action.
- **`OWNER_EMAIL` unset in prod** = nobody can ingest (fail-closed is intentional, not a bug).
- **Exposing the service-role key to the client** — `createAdminClient` is server-only; never import it into a `"use client"` file.
