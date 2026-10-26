# Rose App task — Design System: Buttons, Checkbox, Badge & Mode Toggle

> **ملخّص بالعربي:** تاسك الـ Button (6 variants + Loading) والـ Checkbox والـ Badge (6 variants) والـ Mode Toggle (Light/System/Dark) من الـ Design System.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Project setup
- Type: Story
- Priority: Medium

## User Story

As a **developer**, I want to **implement reusable Button, Checkbox, Badge, and Mode Toggle components that match the approved Figma design system**, so that **interactions and theming are consistent across the application in light, dark, and system modes**.

## Tasks / Features

### 1. Component Setup

- Modify the existing shadcn/ui component files directly.
- Do not create new component files for the components described in this ticket.
- If a required shadcn/ui primitive is not yet available in the project, add it using the shadcn CLI and customize the generated file.

### 2. Button

Implement all six variants from Figma. The task names and the Figma property names are the same six variants:

- **Solid Maroon** — Figma variant `Primary`
- **Soft Pink** — Figma variant `Secondary`
- **Outline** — Figma variant `Outline`
- **Neutral** — Figma variant `Subtle`
- **Text-only** — Figma variant `Ghost`
- **Destructive Red** — Figma variant `Destructive`

Support the following states:

- **Default:** Displays the normal button appearance.
- **Hovered:** Applies the hover styling specified in Figma.
- **Disabled:** Prevents interaction and displays the disabled styling.
- **Loading:** Displays a spinner next to the label while preventing additional activation.

### 3. Checkbox

Implement the following states:

- **Default:** Unchecked checkbox.
- **Checked:** Displays the selected state.
- **Hovered:** Applies the hover styling specified in Figma.
- **Error:** Displays a red border and an error message below the checkbox, such as `You must accept terms and conditions`.

Additional requirements:

- Support an associated label.
- Support a controlled value.
- Ensure keyboard accessibility.
- Associate the error message with the checkbox for screen readers.

### 4. Badge

Implement all six variants from Figma. They are three Figma color variants, each with two tones:

- **Accent Maroon - Tone 1** and **Tone 2** — Figma variant `Primary`
- **Soft Pink - Tone 1** and **Tone 2** — Figma variant `Secondary`
- **Neutral Grey - Tone 1** and **Tone 2** — Figma variant `Subtle`

Ensure all variants match the approved design in both light and dark modes.

### 5. Mode Toggle

Implement a three-option segmented control with the following options:

- **Light:** Sun icon.
- **System:** Monitor icon.
- **Dark:** Moon icon.

Requirements:

- Highlight the currently selected option.
- Support switching between Light, Dark, and System modes.
- Persist the selected mode across page reloads.
- In System mode, follow the operating system's light/dark preference and update automatically when that preference changes.
- Prevent the wrong theme from flashing during the initial page load.

### 6. Theme Support

- Use the project's semantic color tokens exclusively.
- Ensure all components match the approved Figma design in light and dark modes.
- Maintain visible focus indicators and sufficient contrast across themes.

### 7. RTL/LTR Support

- Ensure component content, icons, labels, and controls remain correctly aligned in both RTL and LTR layouts.
- Maintain consistent spacing and interaction behavior when switching between English and Arabic.

## Validation / Acceptance Criteria

### Component Structure

- Button, Checkbox, Badge, and Mode Toggle are implemented within the existing shadcn/ui component files.
- No new component files are created for these components.
- Missing shadcn/ui primitives are added through the shadcn CLI and customized in their generated files.

### Button

- All six variants match Figma: Solid Maroon, Soft Pink, Outline, Neutral, Text-only, and Destructive Red.
- Every variant supports Default, Hovered, Disabled, and Loading states.
- Disabled buttons cannot be activated.
- Loading buttons display a spinner next to the label.
- Loading buttons cannot be activated again while loading.

### Checkbox

- Supports Default, Checked, Hovered, and Error states.
- Error state displays a red border and an error message below the checkbox.
- Supports an associated label and controlled value.
- Is accessible by keyboard.
- The error message is associated with the checkbox for screen readers.

### Badge

- All six variants match Figma.
- Both tones of each color category are implemented.
- All variants display correctly in light and dark modes.

### Mode Toggle

- Supports Light, System, and Dark modes.
- Displays the correct sun, monitor, and moon icons.
- Highlights the selected option.
- Persists the selected mode across page reloads.
- System mode follows the operating system's theme preference.
- System mode updates when the operating system's preference changes.
- The initial page load does not flash the wrong theme.

### Design System and Accessibility

- All components use semantic design tokens.
- Components match Figma in both light and dark modes.
- RTL and LTR layouts are supported.
- Focus indicators remain visible in both themes.

## States

| Component | States |
|---|---|
| *Button* | Default, Hovered, Disabled, Loading |
| *Checkbox* | Default, Checked, Hovered, Error |
| *Badge* | All six variants, as specified in Figma |
| *Mode Toggle* | Light selected, System selected, Dark selected |

## Edge Cases

- A Loading Button must not trigger additional click actions.
- A Disabled Button must not respond to user interaction.
- The Checkbox error message must remain associated with its checkbox for screen readers.
- The Mode Toggle must not flash the wrong theme on the initial page load.
- The selected theme must persist across page reloads.
- System mode must respond to operating system theme changes.
- Focus indicators must remain visible in light and dark modes.

## Gherkin Scenarios

### Scenario 1: Loading Button Ignores Extra Clicks

```gherkin
Scenario: Loading button ignores extra clicks
  Given a Button is in the Loading state
  When the user clicks it
  Then no second click action is triggered
```

### Scenario 2: Checkbox Error State

```gherkin
Scenario: Checkbox error state
  Given a Checkbox is in the Error state
  Then a red border and an error message are shown below it
  And the message is associated with the checkbox for screen readers
```

### Scenario 3: Mode Toggle Selection Persists

```gherkin
Scenario: Mode Toggle selection persists
  Given the user selects Dark in the Mode Toggle
  When the page is reloaded
  Then Dark is still selected
```

### Scenario 4: System Mode Follows the Operating System

```gherkin
Scenario: System mode follows the operating system
  Given the Mode Toggle is set to System
  When the operating system switches between light and dark
  Then the theme updates to match
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
| `common.theme.light` | Light Mode | الوضع الفاتح |
| `common.theme.dark` | Dark Mode | الوضع الداكن |
| `common.theme.system` | System Mode | وضع النظام |

## Design Reference

**Figma is the source of truth** for dimensions, spacing, typography, colors, icons, variants, and component states.

- **Page:** `Design System - NEW`
- **Frame:** `Components`
- **Components:** `Button`, `Checkbox`, `Badge`, `Mode Toggle`

Any requirement not explicitly specified in this ticket must follow the approved Figma design.
