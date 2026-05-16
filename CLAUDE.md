# CLAUDE.md — DevMentor AI

> Read this before doing anything in this codebase.

---

## What This Project Is

**DevMentor AI** is an Arabic-first AI mentorship platform for Frontend developers. It provides:

- Streaming AI chat with a code-focused mentor persona
- RAG (Retrieval Augmented Generation) from PDF and text knowledge base
- PDF upload & ingestion pipeline
- Multi-session chat history per user

The user is the founder/sole developer. Code quality, clarity, and pedagogical readability matter MORE than cleverness — this codebase is also a personal learning artifact.

---

## Stack (do not change without asking)

| Layer           | Tech                                                  |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 15 (App Router)                               |
| Language        | TypeScript (strict mode)                              |
| Styling         | Tailwind CSS v4 + shadcn/ui                           |
| Auth            | Supabase Auth (Google OAuth)                          |
| Database        | Supabase (PostgreSQL + pgvector)                      |
| AI Chat         | Vercel AI SDK + Groq (`openai/gpt-oss-20b` currently) |
| Embeddings      | Google `text-embedding-004` (768 dims)                |
| i18n            | next-intl v4 (en + ar, RTL)                           |
| Forms           | React Hook Form + Zod                                 |
| Package Manager | **Yarn v1 — never use npm**                           |

---

## Folder Structure (authoritative)

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts                # AI streaming chat
│   │   └── auth/callback/route.ts       # Supabase OAuth callback
│   ├── [locale]/
│   │   ├── (auth)/login/                # Public auth pages
│   │   ├── (dashboard)/
│   │   │   ├── chat/                    # Main chat experience
│   │   │   ├── review/                  # Code review (planned)
│   │   │   └── resources/               # PDF upload + KB management
│   │   ├── layout.tsx
│   │   └── page.tsx                     # Landing page
│   └── layout.tsx
│
├── components/
│   ├── shared/                          # Generic, reusable
│   ├── features/                        # Domain-grouped (chat, review, landing, auth)
│   ├── skeletons/
│   ├── layout/                          # Navbar, Footer, Sidebar
│   └── ui/                              # shadcn — NEVER edit these
│
├── hooks/                               # camelCase + use prefix
├── lib/
│   ├── ai/
│   │   ├── prompts.ts                   # All system prompts live here
│   │   ├── search.ts                    # Vector search wrapper
│   │   └── embeddings.ts
│   ├── actions/                         # "use server" mutations
│   ├── services/                        # Server-side read functions
│   ├── schemas/                         # Zod schemas
│   ├── types/                           # *.d.ts
│   ├── constants/
│   └── utils/
│
├── messages/                            # ar.json + en.json (next-intl)
├── i18n/                                # routing.ts, request.ts, navigation.ts
├── utils/supabase/                      # client.ts, server.ts, admin.ts, middleware.ts
└── proxy.ts                             # Auth + i18n combined (Next 15+ middleware → proxy)
```

---

## Hard Rules (these are non-negotiable)

### TypeScript

- **No `any`** — use `unknown` and narrow it
- Derive types from Zod schemas: `type Fields = z.infer<typeof schema>`
- Type all function return values explicitly
- Prefer discriminated unions over boolean flags

### Components

- **Default to Server Components** — `"use client"` only when needed (events, hooks, browser APIs)
- **Never put `"use client"` on a `page.tsx` or `layout.tsx`** — extract interactive parts into `_components/`
- One component per file
- Named exports for components, default export only for pages/layouts
- No commented-out code, no `console.log` (only `console.error` in catch blocks)
- No unused imports
- Stable IDs as keys in lists — never array index

### Next.js 15 Specifics

- `params` and `searchParams` are **Promises** — always `await` them
- AI calls must go through Route Handlers (`app/api/`) — not Server Actions (Server Actions don't stream natively)
- Wrap async Server Components in `<Suspense>` with skeleton fallback
- Use `next/image` — never `<img>`

### File / Symbol Naming

| Type          | Convention           | Example                |
| ------------- | -------------------- | ---------------------- |
| Route folders | kebab-case           | `code-review/`         |
| Components    | PascalCase           | `ChatMessage.tsx`      |
| Hooks         | camelCase + `use`    | `useChatHistory.ts`    |
| Schemas       | camelCase + `Schema` | `reviewSchema`         |
| Services      | `feature.service.ts` | `chat.service.ts`      |
| Actions       | camelCase + `Action` | `saveMessageAction`    |
| Constants     | SCREAMING_SNAKE      | `MAX_TOKENS`           |
| Types files   | `feature.d.ts`       | `chat.d.ts`            |
| AI prompts    | SCREAMING_SNAKE      | `MENTOR_SYSTEM_PROMPT` |

### Component Internal Order

```typescript
export function MyComponent() {
  // Translation
  // Navigation
  // State
  // Refs
  // Context
  // Hooks (auth, AI, custom)
  // Queries
  // Mutations
  // Form & validation
  // Variables
  // Functions
  // Effects

  return <></>;
}
```

Always leave a blank line between sections. Add a short comment label before each section. No section labels = it's a smell, fix it.

### Import Order

```typescript
// 1. React / Next core
// 2. Third-party libraries
// 3. Internal aliases (@/...)
// 4. Relative imports
```

### i18n

- Zero hardcoded user-facing strings — everything via `useTranslations()` / `getTranslations()`
- RTL: `dir="rtl"` on `<html>` when locale is `ar`
- Use logical CSS (`ms-*`, `me-*`, `ps-*`) in shared components

### Auth

- Two Supabase clients: `client.ts` (browser), `server.ts` (server)
- Always `supabase.auth.getUser()` — never `getSession()` (less secure)
- Protect routes in `middleware.ts` — not inside pages
- Sign out via Server Action

### AI / RAG

- All system prompts live in `lib/ai/prompts.ts` — **never inline**
- Always set `maxTokens` on every AI call
- Always auth-check inside Route Handlers before calling models
- Use `useChat` from `ai/react` on the client — never raw fetch
- Render AI messages with Markdown + syntax highlighting
- Rate-limit every AI endpoint (per-user, in DB or Redis)
- Save messages to DB in `onFinish` callback — not on stream chunk

### Mutations Pattern

**Server Action → Custom Hook (useMutation) → Component** — three layers, always.

- Auth check in every Server Action
- Custom hook wraps every mutation — components never call `useMutation` directly
- Centralize query keys in `lib/constants/query-keys.constant.ts`

### Database

- All tables have RLS enabled
- Every user-owned table policy: `auth.uid() = user_id`
- Never expose service role key to the client
- Use `createAdminClient()` only in server actions/route handlers when bypassing RLS is required

---

## Current State of the Codebase (be honest about smells)

The user has explicitly flagged these issues — when reviewing, look for and fix them:

1. **Prop drilling** — too many props passed through layers. Lift state to context or co-locate with usage.
2. **Over-engineering** — abstractions that exist for hypothetical future cases, not current needs. Inline single-use helpers, delete one-off "utility" files.
3. **Complex logic** — chained conditionals, nested ternaries, deeply nested useEffects. Refactor to early returns, named functions, derived state.
4. **Unneeded implementations** — features built ahead of time, dead code, commented-out blocks, unused props/state.
5. **Inconsistent patterns** — some places follow the rules above, others don't. Bring everything into alignment.

When in doubt: **prefer the simpler, more readable version**, even if it's slightly more verbose. The user is studying this code.

---

## What "Clean" Means in This Codebase

A function is clean if:

- It does one thing, and its name says exactly what
- A junior dev reading it for the first time understands it in under 30 seconds
- The "why" is in comments (only when non-obvious); the "what" is in the code
- It returns early instead of nesting
- It has no parameters that are only used in 1 of 3 branches

A component is clean if:

- Sections are labeled (Translation / State / Effects / etc.) and separated by blank lines
- Props < 6 — if more, group them into an object or split the component
- No `useEffect` doing data fetching — that goes in a hook or Server Component
- No inline arrow functions inside JSX for non-trivial logic — extract to a named function
- Markup and logic are visibly separated, not interleaved

---

## What NOT to Touch

- `components/ui/*` — these are shadcn-generated, treat as vendor code
- `messages/ar.json` and `messages/en.json` content — only add new keys, don't rephrase existing ones unless asked
- The Supabase database schema — the user runs SQL changes manually
- The chosen tech stack — no swapping libraries (e.g., don't suggest Drizzle, Prisma, NextAuth, LangChain)

---

## Communication Style with the User

- The user prefers **short, direct answers** in Arabic-English code-switching (Arabic explanation + English technical terms)
- When the user asks "why X?" — explain reasoning in 2-3 lines, not an essay
- Show diffs/changed sections, not full files, when refactoring
- Flag trade-offs explicitly: "I simplified X but this means Y"
- If a "fix" requires changing more than 3 files, **stop and ask first**

---

## When Reviewing / Refactoring

Before changing anything:

1. Identify which rule(s) above the existing code violates
2. Quote the rule
3. Show the smallest possible fix
4. Explain in one line why the new version is better

Don't rewrite working code just for style preference — only when it violates a rule, has a real readability problem, or has dead/duplicated logic.

---

## Common Pitfalls in This Project

- **Mixing chat session state across components via props** — should live in a context or zustand store at the chat shell level
- **Forgetting `await` on `params` / `searchParams`** in Next 15
- **Calling AI from Server Action** — won't stream properly, must be Route Handler
- **Hardcoded strings** in feature components — must be in `messages/*.json`
- **Building features without RLS policies** — every new table must enable RLS day one
- **Calling `useChat` raw fetch wrapper** — always use the hook from `ai/react`

---

## Switching chat provider

To switch the active chat model: change `ACTIVE_CHAT_PROVIDER_ID` in `src/lib/ai/providers.ts` to one of the IDs in `CHAT_PROVIDERS` and restart `yarn dev`. No automatic fallback — intentional. If the active provider fails, the request fails and we see it instead of silently retrying a second model on the same key.

The catalog (`CHAT_PROVIDERS`) carries per-provider `streamOptions` (e.g. `structuredOutputs: false` for gpt-oss, `thinkingConfig: { thinkingBudget: 0 }` for Gemini) and `capabilities` (image/file support), so the route stays provider-agnostic. Add a new entry to the catalog before pointing `ACTIVE_CHAT_PROVIDER_ID` at it.

---

## Quick Reference Commands

```bash
yarn dev              # Local dev
yarn build            # Production build (run before commit if touching configs)
yarn lint             # ESLint
yarn type-check       # tsc --noEmit (if defined in package.json)
```

---

End of CLAUDE.md. When in doubt, ask the user before making structural changes.
