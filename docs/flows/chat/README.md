# Chat Flow

This folder explains, in plain English, how the `/chat` feature works end-to-end.
Each `.md` file mirrors a real file in the app so you can read the doc next to the code.

## Where to start reading

Read the files in this order; each step "hands off" to the next one:

1. `page.md` — what happens when the user opens `/{locale}/chat` (no session in the URL).
2. `[sessionId]/page.md` — what happens when the user opens `/{locale}/chat/{sessionId}`.
3. `chat-shell.md` — the client component both pages render. It owns the URL ↔ state sync and lays out the sidebar + main area.
4. `sidebar/sidebar.md` — left rail with brand, "New chat", chat history, and user/sign-out.
5. `chat-section/chat-area.md` — top header + locale switch + error banner. Loads messages for an existing session.
6. `chat-section/chat-session-panel.md` — the brain of the chat. Owns messages state, persistence, and streaming.
7. `chat-section/welcome-screen.md` — empty-state shown before the first message.
8. `chat-section/message-bubble.md` — how a single message (user or assistant) is rendered.
9. `chat-section/chat-input.md` — textarea, attachments, send/stop button.

## Mental model

```
URL  ──►  Server page (page.tsx)
            │
            │ loadAuthenticatedChatSessions → User + chat_sessions[]
            ▼
       <ChatShell>                                   (client, owns URL state)
       ├── <ChatSidebar>            (sessions list, new chat, sign out)
       └── <SidebarInset>
             └── <ChatArea>         (header + locale switch + error banner)
                   └── <ChatSessionPanel>  (messages, send, persistence)
                         ├── <WelcomeScreen>      (when 0 messages)
                         ├── <Conversation>
                         │     └── <MessageBubble>… + <TypingIndicator>
                         └── <ChatInput>          (textarea + attachments + submit)
```

## Server vs. client

- The two `page.tsx` files are **server components**. They require a signed-in user (redirect to login if missing), fetch that user's chat sessions, and pass the data into `ChatShell`.
- Everything from `ChatShell` and below is a **client component** (`"use client"`). All real-time UI, navigation, streaming, and Supabase realtime live there.

## Data sources used by this flow

- `loadAuthenticatedChatSessions({ locale, callbackPath })` — shared helper in `src/lib/utils/auth/load-authenticated-chat-sessions.ts`: calls `getServerSupabaseAuth()`, redirects to login with `callbackUrl` when anonymous, then loads sessions (see `getChatSessions` in `chat.service.ts`).
- Unauthenticated access to `/chat` is blocked in **`src/proxy.ts`**; the helper adds the same guarantee on the server for `ChatShell` data.
- `getChatSessions(userId)` — Supabase query: all rows from `chat_sessions` for that user, sorted by `updated_at desc`.
- `getChatMessagesAction(sessionId)` — server action used on the client to lazy-load messages of a selected session.
- `saveChatMessageAction({ sessionId, role, content })` / `updateSessionTitleAction(sessionId, title)` / `createChatSessionAction(title)` — server actions called from the client to persist user messages, assistant replies, derive the session title from the first user message, and create a brand new session on demand.
- Supabase realtime channel `chat_sessions_changes:{userId}` — used by the sidebar to keep the session list fresh when rows are inserted/updated/deleted elsewhere.

## Why these docs exist

1. To **fully understand** every component without re-reading the source each time.
2. To make **debugging** faster: jump straight to the file that owns the behavior you're chasing.
3. To **review AI-generated code** with intent in mind, so you can adjust or learn from it.
4. To act as a **personal blueprint** so you can rebuild the same feature in another project from scratch.
