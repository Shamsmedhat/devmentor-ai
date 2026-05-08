# `src/components/features/chat/chat-section/welcome-screen.tsx`

The empty-state shown by `ChatSessionPanel` before the first message is sent. A centered card with the brand icon, a greeting, and three suggestion chips.

## 1. Purpose

- Give the user something to look at when there are no messages yet.
- Offer three localized starter prompts that, on click, prefill the input and focus it.

## 2. Props

```ts
interface WelcomeScreenProps {
  setInput: (value: string) => void;                 // updates useChat's input
  inputRef: RefObject<HTMLTextAreaElement | null>;   // the actual textarea below
}
```

Both come from `ChatSessionPanel`.

## 3. Step-by-step

1. Get the translator with `useTranslations()`.
2. Build `suggestions` — an array of three localized strings (`chat-suggestion-1` … `chat-suggestion-3`).
3. Define `handleSuggestion(text)`:
   - Call `setInput(text)` to populate the parent's `useChat` input state.
   - Schedule `inputRef.current?.focus()` on the next tick (`setTimeout(..., 0)`) so the focus call runs *after* `ChatInput` re-renders with the new value.

## 4. Renders

- A full-height flex container, centered.
- A 20×20 rounded square holding the custom `BrainHexIcon` (a hex frame with a stylized brain inside).
- A title `t("chat-welcome-title")` followed by a wave emoji.
- A muted subtitle `t("chat-welcome-subtitle")`.
- A `<Suggestions>` block with three `<Suggestion>` chips, each calling `handleSuggestion(suggestion)` on click. Stable React keys come from the suggestion text itself.

`BrainHexIcon` is a local SVG component defined at the bottom of the file — kept colocated since it's not reused elsewhere yet.

## 5. Gotchas / notes

- **Why `setTimeout(..., 0)` for focus.** Focusing inside the same tick as the state change can lose focus to the textarea's controlled re-render. Deferring by a microtask/macrotask sidesteps that. Could also be a `requestAnimationFrame`, but `setTimeout(0)` is fine here.
- **Suggestions use the raw text as the key.** Acceptable while the strings are unique per locale; if you ever ship two identical suggestions, switch to a stable id.
- **The `BrainHexIcon` accents (`text-chart-2`)** should match the brand accent used in the sidebar. If you re-skin, change both together to keep visual consistency.
- **No tests on file size or analytics on chip clicks yet.** Easy hooks to add later for usage insight.
