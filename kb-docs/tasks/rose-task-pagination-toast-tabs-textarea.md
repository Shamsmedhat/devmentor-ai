# Rose App task — Design System: Pagination, Toast, Tabs & Textarea

> **ملخّص بالعربي:** تاسك الـ Pagination (مربوطة بالـ URL) والـ Toast (3 variants) والـ Tabs والـ Textarea من الـ Design System.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Project setup
- Type: Story
- Priority: Medium

## User Story

As a **developer**, I want to **implement reusable Pagination, Toast, Tabs, and Textarea components that match the approved Figma design system**, so that **navigation, notifications, tab interactions, and long-text inputs behave consistently in light and dark modes**.

## Tasks / Features

### 1. Component Setup

- Modify the existing shadcn/ui component files directly:
  - `Pagination`
  - `Toast`
  - `Tabs`
  - `Textarea`
- Do not create new component files for these components.
- Follow the existing project structure and design system conventions.

### 2. Pagination

Implement pagination controls as specified in Figma:

- **First:** `<<`
- **Previous:** `<`
- **Page Numbers:** Direct page selection with an ellipsis when needed, e.g., `1 2 3 ... 10`.
- **Next:** `>`
- **Last:** `>>`

Requirements:

- Highlight the current page.
- Support the current page, total pages, and configurable page size.
- Synchronize the current page and page size with URL query parameters, e.g., `?page=2&limit=10`.
- Restore pagination state on page refresh and browser back/forward navigation.
- Support page-size configuration through a prop or URL parameter. A page-size selector is not required because it is not shown in Figma.
- Disable the first and previous controls on the first page.
- Disable the next and last controls on the last page.
- Handle empty datasets, single-page datasets, and invalid page numbers.

### 3. Toast

Implement the three variants specified in Figma:

- **Informative:** Default informational notification.
- **Successful:** Success notification.
- **Unsuccessful:** Error notification.

Requirements:

- Display the appropriate icon and styling for each variant.
- Include a close (`×`) button to dismiss the toast.
- Support light and dark modes.
- Provide accessible screen-reader announcements using an appropriate live region.
- Support configurable auto-dismiss behavior.
- Handle multiple simultaneous toasts without breaking the layout.

### 4. Tabs

Implement the segmented tab style shown in Figma.

Requirements:

- Display the active tab clearly.
- Support the Default, Hovered, Focused, Disabled, and Active states.
- Associate each tab with its corresponding panel using the appropriate ARIA attributes.
- Support keyboard navigation.
- Prevent disabled tabs from being activated.
- Ensure disabled tabs are skipped or remain inert during keyboard navigation, following the chosen tab interaction pattern.
- Maintain focus correctly when switching tabs.

### 5. Textarea

Implement the following states:

- Default
- Hovered
- Focused
- Error
- Disabled

Requirements:

- Support placeholder text and filled-text states as specified in Figma.
- Support a controlled value.
- Support an error message.
- Cap the maximum resize height so the textarea cannot break the page layout.
- Preserve `maxLength` and character-count functionality where already supported by the existing input design system. Neither needs to be displayed by default because they are not shown in Figma.
- Ensure `maxLength` applies to both typed and pasted text.

### 6. Theme Support

- Use the project's semantic color tokens exclusively.
- Ensure all components match Figma in both light and dark modes.
- Reuse existing design system tokens for hover, focus, and disabled states.
- Maintain readable contrast and visible focus indicators.

### 7. RTL/LTR Support

- Ensure component content, icons, controls, and spacing remain correctly aligned in both RTL and LTR layouts.
- Maintain correct pagination navigation and tab interaction behavior when switching between English and Arabic.

## Validation / Acceptance Criteria

### Component Structure

- All four components are implemented within the existing shadcn/ui component files.
- No new component files are created for Pagination, Toast, Tabs, or Textarea.

### Pagination

- Supports first, previous, direct page selection, next, and last navigation.
- Highlights the current page.
- Synchronizes the current page and page size with URL query parameters.
- Restores pagination state on refresh and browser back/forward navigation.
- Handles empty datasets, single-page datasets, and invalid page numbers.
- Handles missing, negative, and out-of-range page parameters safely.
- Disables first and previous controls on the first page.
- Disables next and last controls on the last page.
- Resets to a valid page when the page size changes.
- Avoids stale data when requests finish out of order.

### Toast

- Supports Informative, Successful, and Unsuccessful variants.
- Displays the correct colors and icons for each variant.
- Includes a functional close button.
- Supports configurable auto-dismiss behavior.
- Provides accessible screen-reader announcements.
- Handles multiple simultaneous toasts without breaking the layout.

### Tabs

- Uses the segmented style shown in Figma.
- Clearly identifies the active tab and displays its corresponding panel.
- Supports Default, Hovered, Focused, Disabled, and Active states.
- Uses correct tab and panel ARIA relationships.
- Supports keyboard navigation.
- Prevents disabled tabs from being activated.
- Maintains focus correctly during navigation.

### Textarea

- Supports Default, Hovered, Focused, Error, and Disabled states.
- Supports placeholder text and filled-text states.
- Supports a controlled value and error message.
- Caps the maximum resize height.
- Preserves existing `maxLength` and character-count functionality where applicable.
- Enforces `maxLength` for both typed and pasted text.
- Prevents long text from breaking the layout.

### Design System and Compatibility

- All components use semantic design tokens.
- All components match Figma in light and dark modes.
- RTL and LTR layouts are supported.
- Focus indicators remain visible in both themes.

## States

| Component | States |
|---|---|
| *Pagination* | Default, Active; hover, focus, and disabled states reuse existing design system tokens. |
| *Toast* | Informative, Successful, Unsuccessful. |
| *Tabs* | Default, Hovered, Focused, Disabled, Active. |
| *Textarea* | Default, Hovered, Focused, Error, Disabled. |

## Edge Cases

### Pagination

- Handle missing, negative, invalid, and out-of-range page parameters.
- Handle empty datasets and datasets containing only one page.
- Reset to a valid page when the page size changes.
- Avoid stale data when asynchronous requests finish out of order.
- Keep the URL and displayed pagination state synchronized.

### Toast

- Multiple simultaneous toasts must not break the layout.
- Dismissed toasts must be removed from the visible notification area.
- Auto-dismiss behavior must follow the configured duration.

### Tabs

- Disabled tabs must not become active.
- Keyboard navigation must skip or leave disabled tabs inert.
- Focus must not be lost unexpectedly when switching tabs.

### Textarea

- Long text must not break the layout.
- Maximum resize height must be enforced.
- `maxLength` must apply to both typed and pasted text.
- Disabled and error states must remain visually clear in both themes.

## Gherkin Scenarios

### Scenario 1: Current Page Is Kept in the URL

```gherkin
Scenario: Current page is kept in the URL
  Given the user is on page 2 with a page size of 10
  Then the URL contains "?page=2&limit=10"
  When the user refreshes the page or uses browser back/forward
  Then page 2 is restored
```

### Scenario 2: First Page Disables the Backward Controls

```gherkin
Scenario: First page disables the backward controls
  Given the user is on the first page
  Then first (<<) and previous (<) are disabled
```

### Scenario 3: Dismiss a Toast

```gherkin
Scenario: Dismiss a toast
  Given a Successful toast is shown
  When the user clicks its close (x) button
  Then the toast is dismissed
```

### Scenario 4: Disabled Tab Cannot Be Activated

```gherkin
Scenario: Disabled tab cannot be activated
  Given a tab is disabled
  When the user tries to activate it
  Then it does not become the active tab
```

## Design Reference

**Figma is the source of truth** for dimensions, spacing, typography, colors, icons, component variants, and interaction states.

- **Page:** `Design System - NEW`
- **Frame:** `Components`
- **Components:** `Pagination`, `Toast`, `Tabs`, `Textarea`

Any requirement not explicitly specified in this ticket must follow the approved Figma design.
