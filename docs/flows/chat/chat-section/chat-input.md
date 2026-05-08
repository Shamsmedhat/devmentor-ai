# `src/components/features/chat/chat-section/chat-input.tsx`

The composer at the bottom of the chat: textarea + attachment menu + send/stop button + the AI disclaimer line.

It wraps the generic `<PromptInput>` AI element and keeps two-way sync between the parent's `useChat` state (text + files) and the prompt input's internal provider state.

## 1. Purpose

- Render a polished prompt input UI (textarea, attachment chips, attach/screenshot menu, submit/stop button).
- Keep the prompt input's local state in sync with the parent's `input` value and `attachments` array (parent state is the source of truth).
- Translate prompt-input events (`onSubmit`, `onError`) into the simpler API the parent expects.
- Forward a ref to the underlying `<textarea>` so the welcome screen can focus it after picking a suggestion.

## 2. Props

```ts
interface ChatInputProps {
  input: string;
  attachments: File[];
  isLoading: boolean;                 // declared, but only `status` is read
  status: ChatStatus;                 // pass-through to PromptInputSubmit
  onInputChange(e): void;
  onSubmit(e?, overrides?): void | Promise<void>;
  onStop(): void;
  onFilesSelected(files: FileList | null): void;       // declared, used by parent code paths
  onRemoveAttachment(index: number): void;             // declared, parent removes by index
  onPromptAttachmentError?(code): void;
}
```

The component is a `forwardRef<HTMLTextAreaElement, ChatInputProps>` so the parent can pass an `inputRef` straight to the underlying textarea.

## 3. Inner helpers

### 3.1 `<SyncPromptInputFromParent value={input} />`
- Subscribes to `usePromptInputController()` (the prompt input's internal store).
- On every `value` change from the parent, if the provider's value differs, calls `setInput(value)` to update it.
- Result: typing in the parent (e.g. via `setInput` from `WelcomeScreen` suggestion clicks) is mirrored into the prompt input.

### 3.2 `<SyncParentAttachmentsToProvider files={files} />`
- Computes a stable `sig` string from the parent files (`name:size:lastModified` joined).
- A ref tracks the last sig we synced.
- When the sig changes, `attachments.clear()` and re-`add(files)` into the provider.
- Skipping when sig is unchanged prevents an infinite ping-pong loop with the provider's own state.

### 3.3 `AttachmentItem` (memoized)
- Pure renderer for one attachment chip (preview + remove button).
- Falls back to `"file"` and `"application/octet-stream"` when filename/mediaType is missing.
- `useCallback` for `handleRemove` keeps reference identity stable so the memo holds.

### 3.4 `PromptInputAttachmentsDisplay`
- Reads the live attachments from the provider (`usePromptInputAttachments()`).
- Renders nothing if there are no files; otherwise renders one `AttachmentItem` per file inside `<Attachments variant="inline">`.

### 3.5 `fileUiPartsToFiles(parts)`
- The prompt input emits `files` as URL-based parts (data URLs or blob URLs). Our parent expects real `File` objects for upload/persist.
- For each part: `fetch(url)` → `blob()` → `new File([blob], name, { type, lastModified })`.

## 4. Step-by-step inside `ChatInput`

1. Read props, get the translator with `useTranslations()`.
2. **`handlePromptSubmit(message, event)`** (memoized).
   - Bail when there is no text and no files.
   - Convert the prompt input file parts into real `File`s via `fileUiPartsToFiles`.
   - Call `onSubmit(event, { text: message.text, files })`.
3. **`handlePromptError(err)`** (memoized).
   - Skip if the parent didn't pass `onPromptAttachmentError`.
   - Map prompt input codes (`max_files`, `max_file_size`, `accept`) to our codes (`too_many`, `too_large`, `type_not_allowed`).
   - Forward to the parent.
4. **Render.**

## 5. Renders

```tsx
<PromptInputProvider initialInput={input}>
  <SyncPromptInputFromParent value={input} />
  <SyncParentAttachmentsToProvider files={attachments} />

  <PromptInput
    accept={CHAT_ATTACHMENT_ACCEPT}
    globalDrop
    maxFileSize={CHAT_ATTACHMENT_IMAGE_MAX_BYTES}
    maxFiles={CHAT_ATTACHMENT_MAX_FILES}
    multiple
    onError={onPromptAttachmentError ? handlePromptError : undefined}
    onSubmit={handlePromptSubmit}
  >
    <PromptInputAttachmentsDisplay />
    <PromptInputBody>
      <PromptInputTextarea
        ref={ref}
        dir="auto"
        onChange={onInputChange}
        placeholder={t("chat-placeholder")}
      />
    </PromptInputBody>
    <PromptInputFooter>
      <PromptInputTools>
        <PromptInputActionMenu>
          <PromptInputActionMenuTrigger />
          <PromptInputActionMenuContent>
            <PromptInputActionAddAttachments label={t("chat-attach-file")} />
            <PromptInputActionAddScreenshot />
          </PromptInputActionMenuContent>
        </PromptInputActionMenu>
      </PromptInputTools>
      <PromptInputSubmit onStop={onStop} status={status} />
    </PromptInputFooter>
  </PromptInput>

  <p className="text-muted-foreground px-1 text-center text-xs">
    {t("chat-ai-disclaimer")}
  </p>
</PromptInputProvider>
```

Key constants:
- `CHAT_ATTACHMENT_ACCEPT` / `CHAT_ATTACHMENT_IMAGE_MAX_BYTES` / `CHAT_ATTACHMENT_MAX_FILES` come from `src/lib/constants/chat-attachments.constant.ts`. The prompt input enforces them at the UI level; the parent enforces them again before persistence.

## 6. Gotchas / notes

- **The parent is the source of truth for both text and attachments.** The two `Sync*` components are how we paper over the fact that `<PromptInput>` ships with its own provider state. If you remove them, suggestion clicks from `WelcomeScreen` won't show in the textarea.
- **Why a stable sig for attachments?** `File` references are unstable across re-renders even when "the same" files are passed. The sig avoids needless re-syncs that would clear and re-add the prompt input's files mid-typing.
- **`forwardRef` is required.** `WelcomeScreen` calls `inputRef.current?.focus()` after a suggestion click, and the ref needs to land on the actual `<textarea>`.
- **`isLoading` is declared but unused inside this file.** The visual "send vs. stop" toggle is driven by `status` (which is the AI SDK's `ChatStatus`). Consider removing the unused prop in a future cleanup, or use it explicitly for an extra "disabled" state.
- **`globalDrop` enables dropping files anywhere in the window.** Combined with `maxFileSize`/`maxFiles`/`accept`, the prompt input emits an `onError` we translate to our friendly localized banner.
