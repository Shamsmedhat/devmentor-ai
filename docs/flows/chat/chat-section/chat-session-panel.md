# `src/components/features/chat/chat-section/chat-session-panel.tsx`

The brain of the chat. It wires `useChat` (Vercel AI SDK wrapper) to our Supabase persistence and to the input/messages UI.
Every send, every save, every "create a session on the first message" lives here.

## 1. Purpose

- Hold the live conversation state via `useChat` (messages, input, status, attachments).
- Make sure a `chat_sessions` row exists before persisting a user message - create one on demand if not.
- Persist the user message, then trigger the AI response, then persist the assistant message when streaming finishes.
- Update the session title from the first user message.
- Show the welcome screen when the conversation is empty, or render the message list with a typing indicator while waiting.
- Render the chat input.

## 2. Props

```ts
interface ChatSessionPanelProps {
  initialMessages: ChatMessage[]; // history loaded by ChatArea
  isLoadingSessionMessages: boolean; // true while ChatArea fetches
  selectedSessionId: string | null; // active session id
  onSelectedSessionIdChange(id, options?): void; // bubble up new session id
  onSyncChatSessionUrl(sessionId): void; // tell shell to update the URL
  onSessionsRefresh(): void; // hint shell to refresh the list
  errorMessage: string; // generic localized error string
  attachmentErrorKeys: { too_many; too_large; type_not_allowed }; // localized attachment errors
  onTitleChange(title): void; // bubble up the derived chat title
  onBannerError(message: string | null): void; // show/hide the error banner in ChatArea
}
```

## 3. Refs

- `inputRef: HTMLTextAreaElement` - passed down to `WelcomeScreen` (so a suggestion can focus the input) and forwarded to `ChatInput`.
- `persistedSessionIdRef: string | null` - the session id we just persisted the user message into. Read inside `onFinish` so we know which session to attach the assistant reply to.
- `sendLockRef: boolean` - re-entrancy lock around `handleSend` so two rapid clicks/Enter presses can't double-create or double-persist.

## 4. Hooks composition

1. `useChatSession(selectedSessionId)` returns:
   - `sessionId` - the locally tracked session id (mirrors `selectedSessionId` and updates when a new session is created).
   - `createSession()` - async, calls `createChatSessionAction("New Chat")` and updates internal state with the returned id.
2. `useChat({ api: "/api/chat", initialMessages, onError, onFinish })` returns the standard Vercel AI surface:
   - `messages, input, handleInputChange, handleSubmit, status, isLoading, stop, setInput, attachments, addAttachmentsFromFileList, removeAttachment`.
   - `onError` → show the error banner via `onBannerError(errorMessage)`.
   - `onFinish(message)` → see step 5.4.

## 5. Step-by-step flow

### 5.1 Compute `showTypingIndicator`

```
isLoading && messages.length > 0 && lastMessage.role === "user"
```

True between "I sent my message" and "the assistant has started streaming the first character" - that's when the bouncing dots replace the half-empty assistant bubble.

### 5.2 `handleFilesSelected(files)`

- Forward the `FileList` to `addAttachmentsFromFileList` (provided by `useChat`).
- If the result is an error code, call `showAttachmentError(err)`.

### 5.3 `showAttachmentError(err)`

- Map the code (`too_many` | `too_large` | `type_not_allowed`) to the right localized string from `attachmentErrorKeys`.
- Push it through `onBannerError`, then auto-clear it after 4 seconds.

### 5.4 `useChat.onFinish(message)`

Called once the assistant response has fully streamed in:

1. Clear any previous error banner.
2. Read `persistedSessionIdRef.current` - that's the id we wrote the user message to. If missing, bail.
3. `await saveChatMessageAction({ sessionId, role: "assistant", content: message.content })`.
4. Tell the shell `onSyncChatSessionUrl(sid)` so the URL switches to `/chat/{sid}` (no-op if it already matches).
5. Tell the shell `onSessionsRefresh()` (hint for the sidebar list).
6. If saving fails, raise the banner.

### 5.5 `handleSend(e?, overrides?)`

This is the heavy lifter. Step by step:

1. `preventDefault` if a form event was passed.
2. Compute `trimmed` (text) and `files` (attachments), allowing overrides from `ChatInput`'s prompt builder.
3. **Bail** if there's nothing to send (no text and no files) or if we're already loading.
4. **Take the lock** (`sendLockRef.current = true`) and wrap the rest in `try/finally` to release it.
5. **Resolve the session id.** Prefer `useChatSession.sessionId`, then `selectedSessionId`. If still missing → call `createSession()` and notify the shell with `onSelectedSessionIdChange(activeSessionId, { skipNavigation: true })`. The `skipNavigation` flag tells `ChatArea` "don't refetch this session, the messages already live in `useChat` state". If creation fails, raise the banner and bail.
6. **Stash the active id** in `persistedSessionIdRef` so `onFinish` can use it later.
7. **Persist the user message.**
   - `formatUserMessageForPersistence(trimmed, files)` produces a single string blob (text + serialized attachment metadata) that fits a `text` column.
   - `saveChatMessageAction({ sessionId, role: "user", content: persistedContent })`.
8. **Derive the title from the first message.** When `messages.length === 0`, this is the conversation's first send - pick `trimmed || files[0]?.name || persistedContent.slice(0, 40)`, slice to 40 chars, and call `updateSessionTitleAction(activeSessionId, titleSource)`.
9. **Tell the shell** `onSessionsRefresh()` so the sidebar list moves the chat to the top.
10. **Stream the AI reply.** Call `useChat.handleSubmit(e, overrides)` to send the request and let `useChat` do the streaming. `onFinish` (step 5.4) handles the assistant persistence when streaming completes.
11. **Release the lock** in `finally`.

### 5.6 First-message title effect

```ts
useEffect(() => {
  if (messages.length === 1 && messages[0].role === "user") {
    const raw =
      messages[0].content.trim() ||
      messages[0].attachments?.[0]?.filename ||
      "";
    const title = raw.slice(0, 40);
    onTitleChange(title.length < raw.length ? `${title}…` : title || "…");
  }
}, [messages, onTitleChange]);
```

Updates the visible header title the moment the first user message lands in `useChat` state, even before persistence finishes. We append `…` if the raw text was longer than 40 chars; if everything was empty (file-only with no name), we show `…`.

## 6. Renders

- **Empty + loading** → `<ChatMessagesSkeleton />` (a placeholder while `ChatArea` is fetching history).
- **Empty + idle** → `<WelcomeScreen setInput={setInput} inputRef={inputRef} />`.
- **Has messages** → `<Conversation>` with each message as `<MessageBubble>`, plus `<TypingIndicator />` when `showTypingIndicator` is true.
- Always renders `<ChatInput>` at the bottom, wired to all of `useChat`'s state and `handleSend`.

## 7. Gotchas / notes

- **`sendLockRef` is a synchronous lock.** We don't use a state boolean because state updates are batched and could let two clicks slip through. A ref flips immediately.
- **`persistedSessionIdRef` is needed because `onFinish` doesn't capture fresh closure values.** It runs on a callback registered when `useChat` was created, so we hand it the id via a ref instead of via dependencies.
- **`skipNavigation: true` matters for the "first message creates a session" path.** Without it, `ChatArea` would run its big effect, see a new `selectedSessionId`, and refetch messages from the server - but those messages might not be persisted yet (and even if they were, they're already in `useChat`'s state).
- **Title fallback logic uses 40 chars.** Stay consistent with this number elsewhere if you ever change it (sidebar truncation already truncates with CSS, but search/title heuristics may compare against 40).
- **Errors in `saveChatMessageAction` show the banner but don't stop streaming for the assistant message.** The trade-off: a failed user-message persist still lets the user see the AI response in-session. Consider promoting persistence errors to a hard stop if data integrity becomes more important than UX continuity.
