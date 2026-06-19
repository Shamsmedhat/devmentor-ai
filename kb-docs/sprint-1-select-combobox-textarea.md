# Sprint 1 — Select, Dropdown (Combobox) & Textarea Components

## Meta
- Project: Rose App (Elevate Tech bootcamp) — Website
- Sprint: Sprint 1 of 6 (Website)
- Sprint focus: Project setup + the design-system foundation and core UI components
- Shared across all teams: yes — every team gets the same tasks
- Figma: https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

## Story: Select, Dropdown (Combobox) & Textarea Components
- Epic: Design System & Components
- Priority: Medium
- Story points: 3

### User story
As a developer, I want Select, Combobox/Dropdown, and Textarea components, so multi-option selection and long-text input are handled consistently.

### Tasks
- Select: single-select, placeholder, error state, disabled state
- Combobox: searchable input inside dropdown, keyboard navigation, outside-click close
- Textarea: auto-resize option, character count (when maxLength set), error state
- All support dark/light mode and RTL/LTR

### Acceptance criteria (the task is accepted when ALL pass)
1. Select: required validation prevents empty submission
2. Combobox: filter works on partial match, case-insensitive
3. Textarea: maxLength enforced, shows count (current/max)

### States
- Loading: combobox spinner while async options fetch.
- Empty: combobox "No options found" / "لا توجد خيارات".
- Error: red border + message.
- Success: selected value shown clearly in the trigger.

### Edge cases
- Combobox: Escape closes the dropdown and resets search.
- Textarea: paste longer than maxLength truncates to the limit.

### Gherkin
- Given the combobox is open, when the user types "mal", then only "Male" is shown, and pressing Enter selects it.

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| select.placeholder | Select an option | اختر خياراً |
| select.noOptions | No options found | لا توجد خيارات |
| select.search | Search... | بحث... |
| textarea.charCount | {current}/{max} characters | {current}/{max} حرف |
