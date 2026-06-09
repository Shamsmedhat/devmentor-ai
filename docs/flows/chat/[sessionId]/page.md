# `src/app/[locale]/(dashboard)/chat/[sessionId]/page.tsx`

Server page for `/{locale}/chat/{sessionId}` - i.e. opening a specific saved conversation by URL.

## 1. Purpose

Same job as the parent `chat/page.tsx`, **plus**:

- Read `sessionId` from the URL.
- Make sure that session belongs to the currently logged-in user.
- If it doesn't (wrong owner or missing session), **redirect** to `/{locale}/chat`. If there is no signed-in user, **redirect** to login with a safe `callbackUrl` back to this chat URL.
- Otherwise, render `<ChatShell>` and tell it which session is "active" so the panel opens already focused on that chat.

This page is what makes deep-links and browser refresh work.

## 2. Props

```ts
type Props = {
  params: Promise<{ locale: string; sessionId: string }>;
};
```

In Next.js 15 `params` is a promise; await it to read the values.

## 3. `generateMetadata(props)`

1. Await `params` to get `locale`.
2. Get a translator with `getTranslations({ locale })`.
3. Return `{ title, description }` using the same translation keys as the parent page.

Notes:

- We don't customize the metadata per session (no session title in `<title>`). Keep this in mind if SEO/social previews per chat ever become a requirement.

## 4. `ChatSessionPage({ params })`

Step by step:

1. **Read params.** Await to get both `locale` and `sessionId`.
2. **Set the locale for this request** with `setRequestLocale(locale)` (required by `next-intl`).
3. **Load auth + sessions** with `loadAuthenticatedChatSessions({ locale, callbackPath: \`/${locale}/chat/${sessionId}\` })`- same helper as the parent page;`callbackUrl` preserves the deep link after login.
4. **Ownership check.** `const isOwned = initialSessions.some((s) => s.id === sessionId)`. The id must appear in the list returned for the current user (RLS-scoped query), so no extra DB round-trip.
5. **Hard redirect if not owned.** `redirect(\`/${locale}/chat\`)` before rendering.
6. **Render `<ChatShell>`** seeded with the active session id:
   ```tsx
   <ChatShell
     user={user}
     initialSessions={initialSessions}
     initialSessionIdFromUrl={sessionId}
   />
   ```

The shell uses `initialSessionIdFromUrl` to pick the matching title and pre-select that session in the sidebar.

## 5. Renders

The same `<ChatShell>` as the parent page - only `initialSessionIdFromUrl` differs. See `../chat-shell.md`.

## 6. Gotchas / notes

- **`redirect()` throws.** It must be called _outside_ of try/catch (or the catch must re-throw `RedirectError`). We're calling it at the top level, which is correct.
- **Ownership is checked client-side of the DB but server-side of the request.** Because `getChatSessions` is filtered by `user_id` and protected by RLS, simply finding the id in `initialSessions` is a sufficient ownership check; we don't need an extra `.eq("id", sessionId)` query.
- **Why pass `initialSessionIdFromUrl` as a string?** `ChatShell` resolves it against `initialSessions` and falls back gracefully to `null` (default chat) if the id isn't found, so the prop is the only difference between deep-link and root chat pages.
- **No `searchParams` here.** This route doesn't use them - the only piece of URL state we care about is the path segment `sessionId`.
