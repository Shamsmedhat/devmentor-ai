# `src/components/features/chat/sidebar/sidebar.tsx`

The left rail of the chat. Brand at the top, action buttons (New chat, Code review), the chat history list, and the user/sign-out row at the bottom. Subscribes to Supabase realtime so the list stays fresh.

## 1. Purpose

- Show the brand mark.
- Trigger "new chat" and (later) "code review".
- List the user's chat sessions, with the active one highlighted.
- Switch the active session when the user clicks a row.
- Live-refresh the list whenever a row in `chat_sessions` for this user changes (insert/update/delete) — no polling.
- Show user identity (initials + email) and provide sign-out.

## 2. Props

```ts
interface ChatSidebarProps {
  user: User;                                     // Supabase user (chat is auth-only)
  initialSessions: ChatSession[];                 // pre-fetched on the server
  activeSessionId: string | null;                 // highlighted row
  onSessionSelect: (session: ChatSession) => void;
  onNewChat: () => void;
}
```

## 3. State, hooks

- `t = useTranslations()` — localized labels.
- `router = useRouter()` — locale-aware router (used for sign-out redirect to `/`).
- `setOpenMobile = useSidebar().setOpenMobile` — to close the mobile sidebar sheet after picking an item.
- `sessions: ChatSession[]` — local state, seeded from `initialSessions`. Updated by the realtime subscription.
- Derived:
  - `userId = user.id`
  - `initials = (user.email ?? "DM").slice(0, 2).toUpperCase()`
  - `displayName = user.email ?? "Account"` (fallback when the provider did not return an email)

## 4. Step-by-step flow

### 4.1 Realtime subscription effect (`useEffect` keyed by `userId`)
1. Create a browser Supabase client via `createClient()`.
2. Open a channel `chat_sessions_changes:{userId}`.
3. `.on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions", filter: \`user_id=eq.${userId}\` }, ...)` — listen for any insert/update/delete on rows where `user_id = userId`.
4. On every event, run a fresh `select * from chat_sessions where user_id = userId order by updated_at desc` and put the result into `sessions`. (We refetch instead of patching state from the payload to avoid drift.)
5. `.subscribe()` to activate the channel.
6. **Cleanup**: `supabase.removeChannel(channel)` so we don't leak subscriptions on unmount or when `userId` changes.

### 4.2 `handleSignOut()`
1. `await supabase.auth.signOut()`.
2. `router.push("/")` — back to the landing page (locale stripped/preserved automatically by the i18n router).

### 4.3 `handleSessionSelect(session)`
1. Call `onSessionSelect(session)` — bubbles up to `ChatShell`, which updates state + URL.
2. `setOpenMobile(false)` — collapses the sheet on mobile so the user sees the chat.

## 5. Renders

```
<Sidebar collapsible="offcanvas">
  <SidebarHeader>          ← brand (HexIcon + "DevMentor AI")
  <SidebarContent>
    <SidebarGroup>         ← actions: New chat (chart-2 styling), Code review (outline)
    <SidebarGroup>         ← history
      <SidebarGroupLabel>  ← "RECENT" caption
      <SidebarGroupContent>
        if no sessions → centered muted "no chats yet" line
        else → <SidebarMenu> with one button per session:
                 - icon, title (truncated), relative time
                 - `isActive` when session.id === activeSessionId
  <SidebarFooter>          ← initials chip + email + sign-out icon button
</Sidebar>
```

Notes on details:
- Each session row uses `formatRelativeTime(session.updated_at)` (e.g. "2 m ago") to keep the list scannable.
- The active row is styled by the design system via the `isActive` prop on `<SidebarMenuButton>`.
- The sign-out button uses `text-destructive` on hover so the destructive intent is visible.

## 6. Gotchas / notes

- **Mounting `ChatSidebar` with a `key` from `ChatShell`.** The shell rebuilds the key when `user.id` or the session id list changes wholesale. That forces a full remount so the local `sessions` state is re-seeded from the fresh `initialSessions` instead of trying to reconcile.
- **The realtime callback refetches the whole list** instead of mutating from the event payload. It's slightly heavier but keeps ordering and side-data correct without bespoke patching logic.
- **Don't call `router.replace` here.** Selection navigation lives in `ChatShell` (single source of truth for the URL). The sidebar only fires `onSessionSelect`.
- **Mobile sheet closing.** Both "New chat" and selecting a session call `setOpenMobile(false)` so the user always lands on the conversation, not on a still-open sheet.
- **`Code review` button has no handler yet.** Placeholder for an upcoming route. Wire it up by passing an `onCodeReview` prop or pushing to the route directly.
- **The two SVG icons (`HexIcon` here, `BrainHexIcon` in the welcome screen) are colocated.** If a third place ever needs them, lift them into `components/shared/`.
