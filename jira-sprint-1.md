# Elevate Bootcamp — Rose App — Sprint 1 (KAN Sprint 1)

Project: KAN · Sprint: KAN Sprint 1
This document lists the epics and stories assigned to Sprint 1, with tasks, acceptance criteria, states, edge cases, Gherkin scenarios, and i18n keys. When a student asks about a Sprint 1 task, answer from this document.

Design reference (Rose App – Enhanced, design system): https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

---

## Epics

- **Design System & Components** — Tokens, fonts, all UI components. (Priority: Medium)
- **Project Setup & Infrastructure** — Repo, tooling, configs. (Priority: Medium)

---

## Story: Repository & Project Initialization
Epic: Project Setup & Infrastructure · Priority: Highest · Story points: 5

**User story:** As a developer, I want to set up the GitHub repository with all branches, team access, and full project configuration, so that the whole team can start developing from a standardized environment.

**Tasks**
- GitHub repo created with main, testing, and release branches
- All team members + instructor + mentor invited as collaborators
- Next.js 16 initialized with TypeScript (strict mode)
- Tailwind CSS configured with a custom config file
- next-intl configured with /en and /ar route prefixes
- React Query provider + DevTools in dev mode
- React Hook Form + Zod installed
- ESLint + Prettier + Husky + lint-staged configured
- Path alias @/ mapped to src/

**Acceptance criteria**
1. TypeScript compiles with zero errors (tsc --noEmit)
2. Dev server starts without errors on localhost:3000
3. /en and /ar routes are both accessible
4. Lint passes with no errors

**States** — Setup task (no loading/empty). Error: CI fails on lint/type errors, PR blocked from merge. Success: all checks pass, homepage renders, all dependencies installed.

**Edge cases** — Verify branch protection rules are active on testing and release; confirm .env.example is committed but .env is gitignored.

**Gherkin**
- Given the GitHub repository has been created, when a team member clones the repo and runs install + dev, then the Next.js 16 app starts without errors, /en and /ar respond 200, lint returns no errors, and tsc --noEmit exits with code 0.

---

## Story: Design System — Color Tokens, Typography & Dark/Light Mode
Epic: Design System & Components · Priority: High · Story points: 5

**User story:** As a developer, I want to implement the design-system foundation (color palette, typography, switchable dark/light theme) so all components use consistent tokens and the theme toggles globally.

**Tasks**
- Color tokens for Maroon, Red, Pink, Soft Pink, Blue, Emerald, Yellow, Zinc — shades 50–950
- CSS variables defined for each shade and mapped as Tailwind classes
- Sarabun font (EN) + Tajawal font (AR) from Google Fonts with all required weights
- next-themes integration for dark/light mode with localStorage persistence
- Font switches to Tajawal + RTL direction when locale = ar
- No FOUC on initial load

**Acceptance criteria**
1. All color shades accessible via Tailwind classes (bg-maroon-500, text-zinc-100, etc.)
2. Dark-mode CSS variables correctly applied on html[data-theme='dark']
3. Fonts load correctly; Tajawal active in the /ar route

**States** — Loading: theme/font loaded server-side, no flash. Error: font fails to load → system fallback, no layout shift. Success: theme toggle switches all CSS variables, preference persists on refresh.

**Edge cases** — RTL layout activated under /ar via next-intl locale direction; prefers-color-scheme respected on first visit.

**Gherkin**
- Given the app is in light mode, when the user clicks the theme toggle, then the UI switches to dark mode via CSS variables and the preference persists on refresh.
- Given the user navigates to /ar, when any page renders, then Tajawal font is active and direction is RTL.

**i18n (Key / EN / AR)**
| Key | EN | AR |
|---|---|---|
| theme.toggle | Toggle theme | تبديل المظهر |
| theme.light | Light | فاتح |
| theme.dark | Dark | داكن |

---

## Story: Input Component — All Variants
Epic: Design System & Components · Priority: High · Story points: 5

**User story:** As a developer, I want to implement the Input component with all 9 design variants, so forms across the app use a consistent, accessible input system.

**Tasks**
- Default: label, placeholder, focus ring
- Number: numeric keyboard, +/- steppers
- Search: leading search icon
- Password: show/hide toggle (eye icon)
- OTP: 6 boxes, auto-advance on digit, auto-back on backspace
- File: custom styled trigger, shows filename after selection
- Phone: country-code prefix dropdown with flag
- Error state: red border, error message below
- Disabled state: reduced opacity, non-interactive
- Full dark/light mode and RTL/LTR support

**Acceptance criteria**
1. Required: cannot submit empty field
2. Email type: valid format enforced
3. Password: show/hide toggles input type between text and password
4. OTP: only digits accepted, one per box
5. Phone: validates E.164 format
6. File: validates accepted file types / maxSize when provided

**States** — Empty: placeholder shown. Error: red border + message below. Success: green border when validation passes (optional, per design).

**Edge cases** — OTP paste fills all 6 boxes; dragging a file onto the field triggers selection; in RTL the error icon appears on the left.

**Gherkin**
- Given an email input, when the user submits it empty, then it shows the error state (red border) and an error message below.
- Given the 6-box OTP input, when the user types a digit, then focus auto-advances to the next box.

**i18n (Key / EN / AR)**
| Key | EN | AR |
|---|---|---|
| input.required | This field is required | هذا الحقل مطلوب |
| input.invalidEmail | Invalid email address | عنوان بريد إلكتروني غير صالح |
| input.showPassword | Show password | إظهار كلمة المرور |
| input.hidePassword | Hide password | إخفاء كلمة المرور |
| input.fileSelected | File selected | تم اختيار الملف |

---

## Story: Button, Checkbox & Badge Components
Epic: Design System & Components · Priority: Medium · Story points: 3

**User story:** As a developer, I want Button, Checkbox, and Badge components with all required variants, so interactive elements and status indicators are consistent and accessible.

**Tasks**
- Button: Primary, Secondary, Outline, Ghost, Destructive variants
- Button: Loading (spinner + disabled), Icon (left/right), Disabled
- Checkbox: Default, Checked, Indeterminate, Disabled
- Badge: Default, Success, Warning, Error, Info, Outline
- All support dark/light mode

**Acceptance criteria**
1. Button disabled when loading = true
2. Checkbox emits onChange with the correct boolean
3. Badge renders the correct color per variant

**States** — Loading: button spinner visible, click disabled, text changes. Error: destructive button uses red scheme. Success: success badge uses the Emerald token.

**Edge cases** — Icon-only button renders square with proper padding; indeterminate checkbox on load when some children are selected.

**Gherkin**
- Given the user clicks login, when the API call is in progress, then a spinner shows inside the button, the button is disabled, and the text changes to "Loading…" (EN) / "جاري التحميل…" (AR).

**i18n (Key / EN / AR)**
| Key | EN | AR |
|---|---|---|
| button.loading | Loading... | جاري التحميل... |
| button.submit | Submit | إرسال |
| button.cancel | Cancel | إلغاء |
| button.save | Save | حفظ |
| button.delete | Delete | حذف |
| button.confirm | Confirm | تأكيد |

---

## Story: Select, Dropdown (Combobox) & Textarea Components
Epic: Design System & Components · Priority: Medium · Story points: 3

**User story:** As a developer, I want Select, Combobox/Dropdown, and Textarea components, so multi-option selection and long-text input are handled consistently.

**Tasks**
- Select: single-select, placeholder, error state, disabled state
- Combobox: searchable input inside dropdown, keyboard navigation, outside-click close
- Textarea: auto-resize option, character count (when maxLength set), error state
- All support dark/light mode and RTL/LTR

**Acceptance criteria**
1. Select: required validation prevents empty submission
2. Combobox: filter works on partial match, case-insensitive
3. Textarea: maxLength enforced, shows count (current/max)

**States** — Loading: combobox spinner while async options fetch. Empty: combobox "No options found" / "لا توجد خيارات". Error: red border + message. Success: selected value shown clearly in the trigger.

**Edge cases** — Combobox: Escape closes the dropdown and resets search; Textarea: paste longer than maxLength truncates to the limit.

**Gherkin**
- Given the combobox is open, when the user types "mal", then only "Male" is shown, and pressing Enter selects it.

**i18n (Key / EN / AR)**
| Key | EN | AR |
|---|---|---|
| select.placeholder | Select an option | اختر خياراً |
| select.noOptions | No options found | لا توجد خيارات |
| select.search | Search... | بحث... |
| textarea.charCount | {current}/{max} characters | {current}/{max} حرف |

---

## Story: Toast, Tabs, Pagination & Breadcrumbs Components
Epic: Design System & Components · Priority: Medium · Story points: 3

**User story:** As a developer, I want Toast, Tabs, Pagination, and Breadcrumbs components, so feedback messages, tabbed content, multi-page navigation, and breadcrumb trails are ready across all pages.

**Tasks**
- Toast: Success, Error, Warning, Info variants; auto-dismiss after 3s; closeable; stacks vertically
- Tabs: horizontal tabs with active indicator, optional badge count per tab
- Pagination: page numbers, Prev/Next/First/Last controls, disabled on boundaries
- Breadcrumbs: separator between items, last item non-clickable, collapsible on mobile
- All support dark/light mode

**Acceptance criteria**
1. Pagination: current page highlighted; prev disabled on page 1; next disabled on last page
2. Breadcrumbs: last item has no href / is non-interactive

**States** — Error: error toast (red background, error icon). Success: success toast (green background, check icon).

**Edge cases** — Multiple simultaneous toasts stack without overlapping; pagination with only 1 page disables both prev and next.

**Gherkin**
- Given the user submitted the registration form, when the API returns success, then a green success toast appears ("Account created successfully" / "تم إنشاء الحساب بنجاح") and disappears after 3 seconds.

**i18n (Key / EN / AR)**
| Key | EN | AR |
|---|---|---|
| toast.success | Success | نجاح |
| toast.error | Error | خطأ |
| toast.warning | Warning | تحذير |
| toast.info | Info | معلومة |
| pagination.previous | Previous | السابق |
| pagination.next | Next | التالي |
