# `src/components/features/chat/chat-section/chat-area.tsx`

The right-hand region inside `<SidebarInset>`. Renders the chat header (title + sidebar trigger + locale switch + error banner) and delegates everything below it to `ChatSessionPanel`.

This file's main complexity is **deciding when to (re)load messages for the selected session** — there are several edge-cases (locale switch, brand-new session, fast clicks) and they're each handled with a small ref-based flag.

## 1. Purpose

- Render the visible header bar.
- Switch the UI language without leaving the page.
- Show a top-of-panel error banner when something fails.
- Fetch the historical messages of the selected session (when needed) and pass them as `initialMessages` to `ChatSessionPanel`.
- Force `ChatSessionPanel` to remount whenever the loaded message set changes, so its internal `useChat` hook re-seeds.

## 2. Props

```ts
interface ChatAreaProps {
  selectedSessionId: string | null;                               // active session id from ChatShell
  onSelectedSessionIdChange: (id, options?) => void;              // bubble selection changes upward
  onSyncChatSessionUrl: (sessionId: string) => void;              // tell shell to update the URL
  onSessionsRefresh: () => void;                                  // tell shell to refetch sessions list
  currentTitle: string;                                           // header title text
  onTitleChange: (title: string) => void;                         // bubble title updates upward
}
```

## 3. State, refs, hooks

State:
- `errorMessage: string | null` — banner text, or `null` when hidden.
- `loadedMessages: ChatMessage[]` — messages fetched for the active session.
- `panelKey: number` — bumped to force-remount `ChatSessionPanel`.
- `isLoadingSessionMessages: boolean` — true while we're fetching history for an existing session. Initialized with `Boolean(selectedSessionId)` so the first paint shows the skeleton when arriving on a deep-link.

Refs (don't trigger re-renders, just remember things across renders):
- `tRef` — keeps a fresh reference to the current `next-intl` translator so we can use it inside async work without listing `t` as a dependency of the effect.
- `syncingFromCreateRef` — set `true` for one render when the panel itself just created a new session (we should *not* fetch its messages because we already have them locally; they were typed by the user one tick ago).
- `skipFirstNullClearRef` — `true` initially. The first time `selectedSessionId` is `null`, don't clear `loadedMessages`. This avoids wiping the in-flight messages of a brand-new chat the moment we first render with `null`.
- `skipDuplicateCreateFetchRef` — holds a session id to skip the next would-be fetch for that id (because we just created it client-side and have its history locally).

## 4. Step-by-step flow

### 4.1 Top-of-component setup
1. `useTranslations()` returns `t`. We also store it in `tRef` and update it via `useEffect` so async fetches always use the latest function without re-running the main effect.
2. `useLocale()` gives the current locale; `useRouter()`/`usePathname()` (locale-aware) are used by the locale switch button.
3. State and refs are declared.

### 4.2 `switchLocale(newLocale)`
- Calls `router.replace(pathname, { locale: newLocale })`. The locale-aware router translates the current path into the target locale, so the user stays on the same chat.

### 4.3 The big effect (`useEffect` keyed by `selectedSessionId`)

Reads top-down, returns early in several branches:

1. **No session selected (`null`).**
   - Read `skipClear = skipFirstNullClearRef.current`, then set the ref to `false` so subsequent `null`s *do* clear.
   - Defer the work to the microtask queue (`Promise.resolve().then(...)`) so we don't `setState` synchronously inside the effect tick.
   - Set `isLoadingSessionMessages = false`. If `skipClear` is `true`, return without touching messages. Otherwise reset `loadedMessages = []` and bump `panelKey` to remount the panel into its empty/welcome state.
2. **We just created a session locally** (`syncingFromCreateRef.current === true`).
   - Reset that flag, store the session id in `skipDuplicateCreateFetchRef` (next render will see this same id but should still skip), defer setting `isLoadingSessionMessages = false`. Don't fetch — the panel already has the freshly created messages in its local state.
3. **The id matches what we asked to skip** (`skipDuplicateCreateFetchRef.current === selectedSessionId`).
   - Clear the ref and just turn off the loading flag. Don't fetch.
4. **Real fetch path.**
   - `cancelled = false` — used to ignore the result if the effect re-runs (rapid session switching).
   - Set `isLoadingSessionMessages = true`.
   - `await getChatMessagesAction(selectedSessionId)`.
   - On success: if not cancelled, set `loadedMessages = rows` and bump `panelKey` (forces `ChatSessionPanel` to remount with fresh `initialMessages`).
   - On failure: if not cancelled, set the banner to the localized `chat-error` string.
   - Always: turn off the loading flag (when not cancelled).
   - Cleanup function flips `cancelled = true` so an in-flight request from a previous selection cannot overwrite the newer one.

### 4.4 Render
- Header (`<header>`) with sidebar trigger, the current title, and the locale switch (an inline pair of `AR`/`EN` buttons).
- Optional error banner div, only when `errorMessage` is truthy.
- `<ChatSessionPanel key={panelKey} ... />` — receiving the loaded messages, ids, callbacks, and the localized string set for attachment errors.

## 5. Hands off to

- `ChatSessionPanel` (see `chat-session-panel.md`) — it takes over messages, send, persistence, and streaming.

## 6. Gotchas / notes

- **Why the panel is force-remounted on session change instead of just re-using state.** `useChat` (inside the panel) only consumes `initialMessages` *once*. Bumping the key + remounting is the cleanest way to swap conversations.
- **Why microtasks (`Promise.resolve().then(...)`).** Deferring state updates by one microtask sidesteps occasional React batching/reorder issues when an effect both sets state and triggers a remount via key change.
- **`skipFirstNullClearRef` exists for the first render.** When `ChatShell` mounts for the first time with no URL session, we should *not* erase whatever the panel might have just typed (which only matters during fast HMR/refresh cycles, but the guard keeps things deterministic).
- **The locale switch is a custom button pair, not a `<select>`.** It looks like a pill toggle and matches the dashboard styling. Active locale gets a brighter background.
- **`onSessionsRefresh` is plumbed through but currently a no-op from `ChatShell`.** The panel calls it after persisting messages so the sidebar list moves the chat to the top — the sidebar handles the actual refresh via Supabase realtime, so the call is a hint for the future.
