# Sprint 1 — Button, Checkbox & Badge Components

## Meta
- Project: Rose App (Elevate Tech bootcamp) — Website
- Sprint: Sprint 1 of 6 (Website)
- Sprint focus: Project setup + the design-system foundation and core UI components
- Shared across all teams: yes — every team gets the same tasks
- Figma: https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

## Story: Button, Checkbox & Badge Components
- Epic: Design System & Components
- Priority: Medium
- Story points: 3

### User story
As a developer, I want Button, Checkbox, and Badge components with all required variants, so interactive elements and status indicators are consistent and accessible.

### Tasks
- Button: Primary, Secondary, Outline, Ghost, Destructive variants
- Button: Loading (spinner + disabled), Icon (left/right), Disabled
- Checkbox: Default, Checked, Indeterminate, Disabled
- Badge: Default, Success, Warning, Error, Info, Outline
- All support dark/light mode

### Acceptance criteria (the task is accepted when ALL pass)
1. Button disabled when loading = true
2. Checkbox emits onChange with the correct boolean
3. Badge renders the correct color per variant

### States
- Loading: button spinner visible, click disabled, text changes.
- Error: destructive button uses red scheme.
- Success: success badge uses the Emerald token.

### Edge cases
- Icon-only button renders square with proper padding.
- Indeterminate checkbox on load when some children are selected.

### Gherkin
- Given the user clicks login, when the API call is in progress, then a spinner shows inside the button, the button is disabled, and the text changes to "Loading…" (EN) / "جاري التحميل…" (AR).

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| button.loading | Loading... | جاري التحميل... |
| button.submit | Submit | إرسال |
| button.cancel | Cancel | إلغاء |
| button.save | Save | حفظ |
| button.delete | Delete | حذف |
| button.confirm | Confirm | تأكيد |
