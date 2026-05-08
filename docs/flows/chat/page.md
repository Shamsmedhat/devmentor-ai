# `src/app/[locale]/(dashboard)/chat/page.tsx`

The default chat page, served at `/{locale}/chat` (no session in the URL).
This is a **server component** — it runs on the server, talks to Supabase, then ships the result to the browser as a client tree.

## 1. Purpose

When a user opens `/en/chat` (or `/ar/chat`) directly, this file is responsible for:

- Telling `next-intl` which locale we're rendering for.
- Generating the localized `<title>` and `<meta description>` for SEO.
- Ensuring the user is signed in (defense in depth alongside `src/proxy.ts` for `/chat`) and loading their chat sessions.
- Rendering the client-side `ChatShell` and seeding it with that initial data.

It does **not** know about a specific session — that case is handled by `[sessionId]/page.tsx`.

## 2. Props (the shape Next.js passes in)

```ts
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string | string[] }>;
};
```

In Next.js 15 `params` and `searchParams` are **promises**, so they must be `await`ed.
`searchParams.session` is declared but currently unused — kept in the type so we can later support `?session=...` deep-links without breaking the contract.

## 3. `generateMetadata(props)`

Step by step:

1. Read `params` to pull out the `locale`.
2. Call `getTranslations({ locale })` to get a translator bound to that language.
3. Return `{ title, description }` using the translation keys `metadata-title` and `metadata-description`.

Result: each language gets its own SEO metadata for `/chat`.

## 4. `ChatPage({ params })` — the page component

Step by step:

1. **Resolve params.** Await `params` and pull out `locale`.
2. **Activate the locale on the server.** Call `setRequestLocale(locale)`. This is required by `next-intl` so any child server component (and `getTranslations()` calls inside this request) renders the correct language. Without it the request defaults to the wrong locale.
3. **Load auth + sessions** via `loadAuthenticatedChatSessions({ locale, callbackPath: \`/${locale}/chat\` })` (see `src/lib/utils/auth/load-authenticated-chat-sessions.ts`). That helper redirects to login when there is no user and fetches sessions with a try/catch → `[]` on error.
4. **Render `<ChatShell>`** with three props:
   - `user` — the Supabase `User` (never `null` past this point).
   - `initialSessions` — the array of sessions for the sidebar.
   - `initialSessionIdFromUrl: null` — there is no session in the URL on this route, so we explicitly pass `null` (the sister page passes the real id).

## 5. Renders

```tsx
<ChatShell
  user={user}
  initialSessions={initialSessions}
  initialSessionIdFromUrl={null}
/>
```

From here on, everything happens in the client. See `chat-shell.md` for what `ChatShell` does with these props.

## 6. Gotchas / notes

- **Don't `await` the user inside `generateMetadata` again** — the metadata function is a separate server execution, so doing the work twice is fine and intentional. Keep it light.
- **`initialSessionIdFromUrl` is `null` here on purpose.** That is the only difference between this page and `[sessionId]/page.tsx`.
- **Primary auth gate is `src/proxy.ts`** (protected route `chat`). `loadAuthenticatedChatSessions` adds the same guarantee before `ChatShell` mounts.
