# Sprint 1 — Project Setup: Rose App Team Repository & Design System

## Meta
- Project: Rose App — Jira project "new-rose-app" (key NRA)
- Sprint: NRA Sprint 1
- Jira issue: NRA-1 (Story)

## Story: Project Setup — Rose App Team Repository & Design System
- Epic: NRA-2 — Project setup
- Priority: Medium
- Original estimate: 12h

### User story
As a developer, I want to set up the Rose App project repository, install the required libraries, and configure the design system, so that the team can start development with a consistent foundation for styling, internationalization, and typography.

### Tasks
- Repository Setup: Create a GitHub repository named `rose-app-t<team-number>` and invite all team members as collaborators.
- Project Setup: Initialize the project using Next.js 16 with TypeScript and remove all default demo and boilerplate code provided by Next.js.
- Libraries: Install and configure the following:
  - Tailwind CSS
  - shadcn/ui
  - next-intl
- Color System: Define all required project colors and configure semantic color tokens for both light and dark modes.
- Typography: Add and configure all required fonts for immediate use:
  - Sarabun for English (`en`)
  - Tajawal for Arabic (`ar`)
- Internationalization: Ensure the project foundation supports English and Arabic, including RTL/LTR layout direction.
- Project Cleanup: Remove unused files, components, styles, and default assets that are not required for the project.

### Acceptance criteria
1. A GitHub repository named `rose-app-t<team-number>` is created and accessible to all invited team members.
2. The project runs successfully using Next.js 16 and TypeScript.
3. Tailwind CSS, shadcn/ui, and next-intl are installed and configured correctly.
4. All default Next.js demo content and unnecessary boilerplate code are removed.
5. All required project colors are defined and available through reusable design tokens.
6. Semantic color tokens support both light and dark themes.
7. Sarabun is configured for English, and Tajawal is configured for Arabic.
8. Fonts are available through the project's shared styling configuration and can be used immediately.
9. The project supports English and Arabic locales with the appropriate LTR and RTL directions.
10. The application builds and runs without configuration errors.

### States
- Light Mode: Semantic colors are applied consistently across the application.
- Dark Mode: Semantic colors adapt to the dark theme while maintaining readability and contrast.
- English (LTR): Sarabun is applied, and the layout follows left-to-right direction.
- Arabic (RTL): Tajawal is applied, and the layout follows right-to-left direction.

### Edge cases
- Adding new UI components must allow them to use semantic color tokens instead of hardcoded color values.
- Switching between English and Arabic must update the font and layout direction correctly.
- All team members must have the appropriate repository access to contribute to the project.
- The setup must remain compatible with the installed versions of Next.js, Tailwind CSS, shadcn/ui, and next-intl.

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| common.theme.light | Light Mode | الوضع الفاتح |
| common.theme.dark | Dark Mode | الوضع الداكن |
| common.locale.en | English | الإنجليزية |
| common.locale.ar | Arabic | العربية |
