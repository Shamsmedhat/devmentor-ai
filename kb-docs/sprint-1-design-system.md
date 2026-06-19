# Sprint 1 — Design System: Color Tokens, Typography & Dark/Light Mode

## Meta
- Project: Rose App (Elevate Tech bootcamp) — Website
- Sprint: Sprint 1 of 6 (Website)
- Sprint focus: Project setup + the design-system foundation and core UI components
- Shared across all teams: yes — every team gets the same tasks
- Figma: https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

## Story: Design System — Color Tokens, Typography & Dark/Light Mode
- Epic: Design System & Components
- Priority: High
- Story points: 5

### User story
As a developer, I want to implement the design-system foundation (color palette, typography, switchable dark/light theme) so all components use consistent tokens and the theme toggles globally.

### Tasks
- Color tokens for Maroon, Red, Pink, Soft Pink, Blue, Emerald, Yellow, Zinc — shades 50–950
- CSS variables defined for each shade and mapped as Tailwind classes
- Sarabun font (EN) + Tajawal font (AR) from Google Fonts with all required weights
- next-themes integration for dark/light mode with localStorage persistence
- Font switches to Tajawal + RTL direction when locale = ar
- No FOUC on initial load

### Acceptance criteria (the task is accepted when ALL pass)
1. All color shades accessible via Tailwind classes (bg-maroon-500, text-zinc-100, etc.)
2. Dark-mode CSS variables correctly applied on html[data-theme='dark']
3. Fonts load correctly; Tajawal active in the /ar route

### States
- Loading: theme/font loaded server-side, no flash.
- Error: font fails to load → system fallback, no layout shift.
- Success: theme toggle switches all CSS variables, preference persists on refresh.

### Edge cases
- RTL layout activated under /ar via next-intl locale direction.
- prefers-color-scheme respected on first visit.

### Gherkin
- Given light mode, when the user clicks the theme toggle, then the UI switches to dark via CSS variables and persists on refresh.
- Given the user navigates to /ar, when any page renders, then Tajawal font is active and direction is RTL.

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| theme.toggle | Toggle theme | تبديل المظهر |
| theme.light | Light | فاتح |
| theme.dark | Dark | داكن |
