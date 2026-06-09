# `src/components/features/chat/chat-shell.tsx`

The top-level **client** component for the chat feature. Both `chat/page.tsx` and `chat/[sessionId]/page.tsx` render this. It owns the URL ↔ selection sync and lays out the sidebar and main panel.

## 1. Purpose

- Decide which session is "currently active" based on the URL the user came in on.
- Keep the URL in sync when the user picks a different session, starts a new chat, or the panel creates a new session for them.
- Provide the sidebar layout (`SidebarProvider` + `SidebarInset`) so the sidebar can be opened/closed (especially on mobile).
- Pass down callbacks the sidebar and chat area use to switch sessions.

## 2. Props

```ts
interface ChatShellProps {
  user: User; // Supabase user (chat routes require auth)
  initialSessions: ChatSession[]; // sessions list pre-fetched on the server
  initialSessionIdFromUrl: string | null; // session in the URL (`null` on /chat)
}
```

## 3. Helper: `matchUrlSessionIdToSessions(sessions, urlSessionId)`

Pure function used at the top of the component to translate "URL says session X" into "use this id in the UI".

Logic:

1. If `urlSessionId` is `null` → `{ sessionId: null, title: "DevMentor AI" }` (default chat).
2. Otherwise, find the matching session in the list:
   - Not found → `{ sessionId: null, title: "DevMentor AI" }` (graceful fallback).
   - Found → `{ sessionId: match.id, title: match.title }`.

This way, the component never has to deal with "we have an id but no title" - both pieces are derived together.

## 4. Step-by-step inside `ChatShell`

1. **Navigation hooks.** Get `router` and `pathname` from `@/i18n/navigation` (the locale-aware versions). They are used later to push the URL when the active session changes.
2. **Resolve the initial selection.** Call `matchUrlSessionIdToSessions(initialSessions, initialSessionIdFromUrl)` and destructure `{ sessionId: urlSessionId, title: urlSessionTitle }`.
3. **State.**
   - `currentTitle` - string shown in the chat header. Starts at `urlSessionTitle`.
   - `selectedSessionId` - the active session id (or `null` for a fresh chat). Starts at `urlSessionId`.
4. **`navigateToChatPath(sessionId)`.** Internal helper:
   - If a session id is provided → `router.replace(\`/chat/${sessionId}\`)` (locale is added automatically by the i18n router).
   - Otherwise → `router.replace("/chat")`.
   - Uses `replace` (not `push`) so the back button doesn't fill up with intermediate URLs.
5. **`handleSessionSelect(session)`.** Called by the sidebar when a chat is clicked. Updates the selected id and title state, then navigates to the corresponding URL.
6. **`handleNewChat()`.** Called by the "New chat" button. Resets the id to `null`, the title to `"DevMentor AI"`, and navigates to `/chat`.
7. **`handleSelectedSessionIdChange(id, options?)`.** Called by `ChatArea`/`ChatSessionPanel` when the panel itself changes the selection (e.g. it just created a new session for the user mid-send). Sets state, then navigates **unless** `options.skipNavigation` is `true`. Skipping navigation lets the panel finish bookkeeping without triggering a re-render storm or a fetch of messages it just created locally.
8. **`syncChatSessionUrl(sessionId)`.** Called once an assistant reply finishes streaming. It checks the current `pathname` and only navigates if the URL doesn't already end with `/chat/{sessionId}` - avoids a redundant `replace` when we're already on the right URL.
9. **`sidebarSessionKey`.** A string key derived from the list of session ids (`"id1:id2:id3"` or `"none"` if empty). It is used in the next step to force the sidebar to remount when the underlying session set changes (sign-in/sign-out, brand-new session, etc.).
10. **Render the layout.**

## 5. Renders

```tsx
<SidebarProvider className="h-svh overflow-hidden">
  <ChatSidebar
    key={`${user.id}:${sidebarSessionKey}`}
    user={user}
    initialSessions={initialSessions}
    activeSessionId={selectedSessionId}
    onSessionSelect={handleSessionSelect}
    onNewChat={handleNewChat}
  />

  <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
    <ChatArea
      selectedSessionId={selectedSessionId}
      onSelectedSessionIdChange={handleSelectedSessionIdChange}
      onSyncChatSessionUrl={syncChatSessionUrl}
      onSessionsRefresh={() => {}}
      currentTitle={currentTitle}
      onTitleChange={setCurrentTitle}
    />
  </SidebarInset>
</SidebarProvider>
```

- `<SidebarProvider>` provides the open/closed state to descendants and the `useSidebar()` hook used in `sidebar.tsx`.
- `<ChatSidebar>` renders the left rail.
- `<SidebarInset>` is the main content area that adjusts when the sidebar opens/closes.
- `<ChatArea>` is the entire right side (header + body).

## 6. Gotchas / notes

- **`router.replace` vs `router.push`.** We always replace - picking a different chat shouldn't add to history.
- **Why the sidebar `key` includes both `user.id` and the session id list.** When the session set changes wholesale (or after a future account switch), we want React to mount a fresh `<ChatSidebar>` so its `useState` for sessions re-seeds from `initialSessions` and the realtime channel is recreated cleanly.
- **`onSessionsRefresh={() => {}}`** is a deliberate no-op. The sidebar already subscribes to `chat_sessions` realtime updates and refreshes itself. The prop is kept so we can plug in an imperative refresh later (e.g. from an admin tool) without reshuffling the API.
- **`currentTitle` lives here, not in the panel.** That way the header (rendered by `ChatArea`) and the URL-driven title pick logic stay in sync, and the panel can update the title (`onTitleChange`) without owning it.
- **`urlSessionTitle` is computed once at render time** from props. If `initialSessions` later changes (e.g. realtime), we deliberately _don't_ re-derive - the user has been interacting and we don't want their title silently flipping under them.
