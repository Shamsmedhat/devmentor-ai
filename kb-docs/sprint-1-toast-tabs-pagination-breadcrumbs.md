# Sprint 1 — Toast, Tabs, Pagination & Breadcrumbs Components

## Meta
- Project: Rose App (Elevate Tech bootcamp) — Website
- Sprint: Sprint 1 of 6 (Website)
- Sprint focus: Project setup + the design-system foundation and core UI components
- Shared across all teams: yes — every team gets the same tasks
- Figma: https://www.figma.com/design/q5TO5u0kOpfIZhoozTz0mB/Rose-App--Enhanced-?node-id=16745-10693

## Story: Toast, Tabs, Pagination & Breadcrumbs Components
- Epic: Design System & Components
- Priority: Medium
- Story points: 3

### User story
As a developer, I want Toast, Tabs, Pagination, and Breadcrumbs components, so feedback messages, tabbed content, multi-page navigation, and breadcrumb trails are ready across all pages.

### Tasks
- Toast: Success, Error, Warning, Info variants; auto-dismiss after 3s; closeable; stacks vertically
- Tabs: horizontal tabs with active indicator, optional badge count per tab
- Pagination: page numbers, Prev/Next/First/Last controls, disabled on boundaries
- Breadcrumbs: separator between items, last item non-clickable, collapsible on mobile
- All support dark/light mode

### Acceptance criteria (the task is accepted when ALL pass)
1. Pagination: current page highlighted; prev disabled on page 1; next disabled on last page
2. Breadcrumbs: last item has no href / is non-interactive

### States
- Error: error toast (red background, error icon).
- Success: success toast (green background, check icon).

### Edge cases
- Multiple simultaneous toasts stack without overlapping.
- Pagination with only 1 page disables both prev and next.

### Gherkin
- Given the user submitted the registration form, when the API returns success, then a green success toast appears ("Account created successfully" / "تم إنشاء الحساب بنجاح") and disappears after 3 seconds.

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| toast.success | Success | نجاح |
| toast.error | Error | خطأ |
| toast.warning | Warning | تحذير |
| toast.info | Info | معلومة |
| pagination.previous | Previous | السابق |
| pagination.next | Next | التالي |
