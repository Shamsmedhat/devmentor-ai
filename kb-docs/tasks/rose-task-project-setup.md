# Rose App task — Project Setup: Rose App Team Repository & Design System

> **ملخّص بالعربي:** تاسك تجهيز المشروع: ريبو GitHub للفريق، Next.js 16 + TypeScript، تركيب Tailwind CSS وshadcn/ui وnext-intl، الألوان والـ semantic tokens، خطوط Sarabun وTajawal، دعم العربي والإنجليزي (RTL/LTR)، والـ Light/Dark/System modes.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Project setup
- Type: Story
- Priority: Medium

## User Story

As a **developer**, I want to **set up the Rose App project repository, install the required libraries, and configure the design system**, so that **the team can start development with a consistent foundation for styling, internationalization, and typography**.

## Tasks / Features

### 1. Repository Setup

- Create a GitHub repository named `rose-app-t<team-number>`.
- Invite all team members as collaborators and ensure they have the appropriate access permissions.

### 2. Project Setup

- Initialize the project using **Next.js 16** with TypeScript.
- Remove all default Next.js demo content and boilerplate code.

### 3. Libraries

Install and configure the following libraries:

- **Tailwind CSS** — Utility-first styling.
- **shadcn/ui** — Reusable UI components.
- **next-intl** — Internationalization and locale management.

### 4. Color System

- Define all required project colors.
- Configure reusable semantic color tokens for both light and dark modes.
- Ensure new UI components use semantic tokens instead of hardcoded color values.

### 5. Typography

Add and configure the required fonts for immediate use:

- **English (`en`):** Sarabun.
- **Arabic (`ar`):** Tajawal.

Ensure fonts are available through the project's shared styling configuration.

### 6. Internationalization (i18n)

- Configure support for English (`en`) and Arabic (`ar`).
- Support the appropriate layout direction for each locale:
  - English: Left-to-Right (LTR).
  - Arabic: Right-to-Left (RTL).
- Ensure switching locales updates the font and layout direction correctly.

### 7. Theme Modes

Support the following three theme modes:

- **Light:** Applies the light theme.
- **Dark:** Applies the dark theme.
- **System:** Automatically follows the operating system's light/dark preference and responds to changes.

### 8. Project Cleanup

- Remove unused files and components.
- Remove unnecessary styles and default assets.
- Keep the project structure clean and ready for feature development.

## Validation / Acceptance Criteria

### Repository

- A GitHub repository named `rose-app-t<team-number>` is created.
- All invited team members can access the repository and contribute.

### Project Configuration

- The project runs successfully using Next.js 16 and TypeScript.
- Tailwind CSS, shadcn/ui, and next-intl are installed and configured correctly.
- All default Next.js demo content and unnecessary boilerplate code are removed.
- The application builds and runs without configuration errors.

### Design System

- All required project colors are defined and available through reusable design tokens.
- Semantic color tokens support both light and dark themes.
- New UI components can use semantic color tokens without hardcoding color values.

### Theme Modes

- Light mode applies the correct semantic colors consistently.
- Dark mode adapts semantic colors while maintaining readability and contrast.
- System mode follows the operating system's light/dark preference.
- System mode updates when the operating system's theme preference changes.

### Typography and Internationalization

- Sarabun is configured for English.
- Tajawal is configured for Arabic.
- Fonts are available through the shared styling configuration.
- English and Arabic locales are supported.
- English uses LTR layout direction.
- Arabic uses RTL layout direction.
- Switching between locales updates the font and layout direction correctly.

### Compatibility

- The configuration remains compatible with the installed versions of Next.js, Tailwind CSS, shadcn/ui, and next-intl.

## States

| State | Expected Behavior |
|---|---|
| *Light Mode* | Semantic colors are applied consistently across the application. |
| *Dark Mode* | Semantic colors adapt to the dark theme while maintaining readability and contrast. |
| *System Mode* | The application follows the operating system's light/dark preference and updates when it changes. |
| *English (LTR)* | Sarabun is applied, and the layout follows left-to-right direction. |
| *Arabic (RTL)* | Tajawal is applied, and the layout follows right-to-left direction. |

## Edge Cases

- Adding new UI components must allow them to use semantic color tokens instead of hardcoded color values.
- Switching between English and Arabic must update the font and layout direction correctly.
- All team members must have the appropriate repository access to contribute to the project.
- The setup must remain compatible with the installed versions of Next.js, Tailwind CSS, shadcn/ui, and next-intl.

## Gherkin Scenarios

### Scenario 1: Team Members Can Access the Repository

```gherkin
Scenario: Team members can access the repository
  Given the repository "rose-app-t<team-number>" is created
  When an invited team member opens it
  Then they can access it and contribute
```

### Scenario 2: Switch the Language to Arabic

```gherkin
Scenario: Switch the language to Arabic
  Given the app supports English and Arabic
  When the user switches the language to Arabic
  Then Tajawal is applied
  And the layout follows right-to-left direction
```

### Scenario 3: System Theme Follows the Operating System

```gherkin
Scenario: System theme follows the operating system
  Given the theme mode is set to System
  When the operating system switches between light and dark
  Then the app theme updates to match the operating system preference
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
| `common.theme.light` | Light Mode | الوضع الفاتح |
| `common.theme.dark` | Dark Mode | الوضع الداكن |
| `common.theme.system` | System Mode | وضع النظام |
| `common.locale.en` | English | الإنجليزية |
| `common.locale.ar` | Arabic | العربية |
