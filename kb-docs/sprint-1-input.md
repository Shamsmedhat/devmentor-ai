# Sprint 1 — Input Component (All Variants)

## Meta
- Project: Rose App (Elevate Tech bootcamp) — Website
- Sprint: Sprint 1 of 6 (Website)
- Sprint focus: Project setup + the design-system foundation and core UI components
- Shared across all teams: yes — every team gets the same tasks
- Figma: https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

## Story: Input Component — All Variants
- Epic: Design System & Components
- Priority: High
- Story points: 5

### User story
As a developer, I want to implement the Input component with all 9 design variants, so forms across the app use a consistent, accessible input system.

### The 9 variants (all required for acceptance)
1. Default — label, placeholder, focus ring
2. Number — numeric keyboard, +/- steppers
3. Search — leading search icon
4. Password — show/hide toggle (eye icon)
5. OTP — 6 boxes, auto-advance on digit, auto-back on backspace
6. File — custom styled trigger, shows filename after selection
7. Phone — country-code prefix dropdown with flag
8. Error state — red border, error message below
9. Disabled state — reduced opacity, non-interactive

Plus: full dark/light mode and RTL/LTR support.

### Acceptance criteria (the task is accepted when ALL pass)
1. Required: cannot submit an empty field
2. Email type: valid format enforced
3. Password: show/hide toggles input type between text and password
4. OTP: only digits accepted, one per box
5. Phone: validates E.164 format
6. File: validates accepted file types / maxSize when the prop is provided
7. All 9 variants implemented and follow the design specs
8. i18n implemented (keys below), dark/light mode, and RTL/LTR all working
9. Accessible: label tied to input, correct input type per variant

### States
- Empty: placeholder shown when input is empty
- Error: red border + error message below the field
- Success: green border when validation passes (optional, per design)

### Edge cases
- OTP paste: pasting a 6-digit string fills all boxes
- File input: dragging a file onto the field triggers selection
- RTL: error icon appears on the left side in Arabic

### Gherkin
- Given an email input, when the user submits it empty, then it shows the error state (red border) and a message below.
- Given the 6-box OTP input, when the user types a digit, then focus auto-advances to the next box.

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| input.required | This field is required | هذا الحقل مطلوب |
| input.invalidEmail | Invalid email address | عنوان بريد إلكتروني غير صالح |
| input.showPassword | Show password | إظهار كلمة المرور |
| input.hidePassword | Hide password | إخفاء كلمة المرور |
| input.fileSelected | File selected | تم اختيار الملف |
