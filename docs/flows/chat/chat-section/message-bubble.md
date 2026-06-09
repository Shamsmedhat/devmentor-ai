# `src/components/features/chat/chat-section/message-bubble.tsx`

A single message in the conversation list. Exports two components:

- `MessageBubble` - picks user vs. assistant rendering.
- `TypingIndicator` - three bouncing dots shown while the assistant is "thinking".

## 1. Purpose

- Render a user message (with text and/or attachments).
- Render an assistant message with proper markdown handling, including a "Writing…" placeholder while the first chunk hasn't arrived.
- Render a typing indicator that visually matches an assistant bubble.

## 2. Props

```ts
interface MessageBubbleProps {
  message: ChatMessage; // role, content, attachments?
  isStreaming?: boolean; // true only for the active streaming reply
}
```

## 3. `MessageBubble({ message, isStreaming })`

Step by step:

1. `isUser = message.role === "user"`.
2. If user → return `<UserBubble message={message} />`.
3. Otherwise → return `<AssistantBubble content={message.content} isStreaming={isStreaming} />`.

That's it - `MessageBubble` is just a router into the two real renderers.

## 4. `UserBubble({ message })`

1. `files = message.attachments ?? []`.
2. `hasText = message.content.trim().length > 0`.
3. Render `<Message from="user">` containing `<MessageContent>`:
   - If `hasText` → a `<div className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</div>` so newlines and spacing are preserved exactly as the user typed.
   - If `files.length > 0` → an `<Attachments variant="list">` block with one `<Attachment>` per file. Each attachment shows a preview and a metadata row (`AttachmentInfo showMediaType`). The key is `${filename}-${url}` to be stable across re-renders.

## 5. `AssistantBubble({ content, isStreaming })`

1. Render `<Message from="assistant">` with a small bot icon (`<Bot className="size-5" />`) on the side.
2. Inside `<MessageContent>`:
   - **Streaming with no content yet** (`isStreaming && content.length === 0`) → a pulsing "Writing…" label so the user gets immediate feedback before the first token lands.
   - **Has content** → `<MessageResponse>` (the AI element that knows how to render markdown safely):
     - `mode={isStreaming ? "streaming" : "static"}`.
     - `parseIncompleteMarkdown={isStreaming}` so half-written code fences/lists still render correctly mid-stream.

## 6. `TypingIndicator()`

Same shell as `AssistantBubble` (so it lines up visually), but the content is three `<span>`s with staggered `animation-delay` (0ms, 150ms, 300ms) bouncing as dots.

## 7. Gotchas / notes

- **`isStreaming` is only true for the _last_ assistant message _during_ streaming.** The parent (`ChatSessionPanel`) computes this with:
  ```ts
  isLoading && message.role === "assistant" && index === messages.length - 1;
  ```
  Don't pass it for older messages or you'll get the streaming markdown parser running on static content unnecessarily.
- **`parseIncompleteMarkdown` matters for code blocks.** Without it, an incomplete ```​` fence mid-stream would render as raw text until the closing fence arrives.
- **Stable keys for attachments.** `${filename}-${url}` works because `url` is a Supabase storage path which is unique per upload. Don't use array indices.
- **The Bot icon uses `text-muted-foreground` and `mt-1 shrink-0`** to align with the first line of text - keep these utilities together if you restyle the bubble layout.
