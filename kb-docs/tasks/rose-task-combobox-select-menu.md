# Rose App task — Design System: Dropdown (Combobox), Select & Menu

> **ملخّص بالعربي:** تاسك الـ Dropdown (Combobox) والـ Select والـ Menu. في Figma (Design System - NEW) الـ component اسمه Dropdown وفيه Light و Dark، ومفيش layer اسمه Combobox. التنفيذ: Combobox من Popover + Command بتوع shadcn/ui، بحث case-insensitive، وحالات Loading/Empty/Error.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Project setup
- Type: Story
- Priority: Medium

## User Story

As a **developer**, I want to **implement reusable Dropdown (Combobox), Select, and Menu components that match the approved Figma design system**, so that **users can search and select options or access menu actions through consistent, accessible interactions**.

## Tasks / Features

### 1. Component Setup

- Modify the existing shadcn/ui component files directly.
- Do not create new component files for these components.
- Since shadcn/ui does not provide a single Combobox primitive, build the Combobox using the existing **Popover** and **Command** components and customize their files as needed.
- Implement Dropdown (Combobox), Select, and Menu as three distinct components within the existing shadcn/ui component files.

### 2. Dropdown (Combobox)

Implement a select-style trigger with a searchable options panel, as shown in Figma.

**Requirements:**

- Display a search field at the top of the options panel.
- Filter options using case-insensitive partial matching.
- Typing in the search field must not change the selected value until the user chooses an option.
- Display the selected value in the trigger.
- Support keyboard navigation.
- Pressing `Enter` selects the highlighted option.
- Pressing `Escape` closes the panel and resets the search query.
- Clicking outside the panel dismisses it.
- Prevent disabled options from being selected and skip them during keyboard navigation.
- Support controlled state and asynchronous options.

**Asynchronous states:**

- **Loading:** Display a localized loading message.
- **Empty:** Display a localized message when no options match.
- **Error:** Display a localized message when options fail to load.

Use the existing design system's text and muted color tokens for these states, as Figma does not provide dedicated frames for them.

### 3. Select

Implement a single-select component matching the Figma design.

**Requirements:**

- Display a placeholder when no option is selected.
- Display the selected value when an option is chosen.
- Open an options panel without a search field.
- Support disabled options.
- Support keyboard navigation and accessible selection behavior.
- Integrate with the project's existing form and validation approach, including required-field validation.
- Support controlled state.

### 4. Menu

Implement a menu panel for actions or navigation items.

**Requirements:**

- Display a list of actionable or navigational items.
- Support item selection and action handling.
- Support keyboard navigation and dismissal.
- Prevent disabled items from being activated.
- Reuse the existing Button component for the trigger, since Figma does not provide a dedicated Menu trigger design.
- Use the existing disabled-state tokens for disabled items.

### 5. Theme Support

- Support light and dark modes.
- Use the project's semantic color tokens exclusively.
- Ensure component states match Figma in both themes.
- Reuse existing design system tokens for hover, focus, selected, disabled, and muted states.

### 6. Internationalization (i18n) and RTL/LTR

- Support English (`en`) and Arabic (`ar`).
- Localize placeholders, search prompts, loading messages, empty states, and error messages.
- Ensure all components support RTL and LTR layouts.
- Maintain correct alignment of icons, text, options, and panels in both directions.

## Validation / Acceptance Criteria

### Component Structure

- Dropdown (Combobox), Select, and Menu are three distinct components implemented within the existing shadcn/ui component files.
- No new component files are created.
- Combobox uses the existing Popover and Command primitives.

### Dropdown (Combobox)

- Filters options using case-insensitive partial matching.
- Typing does not change the selected value until an option is chosen.
- Displays the selected value correctly.
- Supports keyboard navigation and `Enter` to select.
- Pressing `Escape` closes the panel and resets the search query.
- Clicking outside dismisses the panel.
- Supports Loading, Empty, and Error states with localized messages.
- Disabled options cannot be selected and are skipped during keyboard navigation.
- Asynchronous searches prevent stale responses from replacing newer results.

### Select

- Supports single selection.
- Displays a placeholder when no option is selected.
- Displays the selected value after selection.
- Does not include a search field.
- Supports disabled options.
- Integrates with the project's existing form and validation approach.
- Supports controlled state and keyboard accessibility.

### Menu

- Supports action and navigation items.
- Item selection triggers the appropriate action or navigation.
- Disabled items cannot be activated.
- Supports keyboard navigation and dismissal.
- Uses the existing Button component as its trigger.

### Design System and Accessibility

- Default, Selected, and Hovered states match Figma in light and dark modes.
- All components use semantic color tokens.
- All components support RTL and LTR layouts.
- Keyboard interactions and focus management work correctly.
- Long option labels do not break the panel layout.
- Multiple component instances on the same page manage focus independently.

## States

| Component | States |
|---|---|
| *Dropdown (Combobox)* | Default, Selected, Hovered, Loading, Empty, Error |
| *Select* | Default, Selected, Hovered |
| *Menu* | Default, Selected, Hovered, Disabled |

**Note:** Loading, Empty, and Error states for the Combobox are not explicitly shown in Figma. Use the existing design system's text and muted tokens.

## Edge Cases

### Dropdown (Combobox)

- Prevent stale asynchronous search responses from replacing newer results.
- Disabled options must not be selectable and must be skipped during keyboard navigation.
- Pressing `Escape` must close the panel and reset the search query.
- Long option labels must not break the panel layout.
- Multiple Combobox instances must manage focus independently.
- Typing a search query must not update the selected value before an option is chosen.

### Select

- Disabled options must not be selectable.
- Required-field validation must integrate with the existing form approach.
- The placeholder must remain visible when no value is selected.

### Menu

- Disabled items must not trigger actions or navigation.
- Dismissing the menu must leave focus in a predictable and accessible state.

## Gherkin Scenarios

### Scenario 1: Combobox Filters the Options

```gherkin
Scenario: Combobox filters the options
  Given the Combobox options panel is open
  When the user types in the search field
  Then only the options that partially match the text (case-insensitive) are listed
  And the selected value does not change until an option is chosen
```

### Scenario 2: Escape Closes the Combobox

```gherkin
Scenario: Escape closes the Combobox
  Given the Combobox options panel is open
  When the user presses Escape
  Then the panel closes
  And the search query is reset
```

### Scenario 3: Disabled Option Is Not Selectable

```gherkin
Scenario: Disabled option is not selectable
  Given an option is disabled
  When the user navigates with the keyboard
  Then the option is skipped
  And it cannot be selected
```

### Scenario 4: Disabled Menu Item

```gherkin
Scenario: Disabled menu item
  Given a Menu item is disabled
  When the user clicks it
  Then its action is not triggered
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
| `select.placeholder` | Select an option | اختر خياراً |
| `select.search` | Search... | بحث... |
| `select.noOptions` | No options found | لا توجد خيارات |
| `select.loading` | Loading options... | جارٍ تحميل الخيارات... |
| `select.error` | Failed to load options | فشل تحميل الخيارات |

## Design Reference

**Figma is the source of truth** for dimensions, spacing, typography, colors, icons, component states, and interactions.

- **Page:** `Design System - NEW`
- **Frame:** `Components`
- **Components:** `Select`, `Dropdown`, `Menu`

Any requirement not explicitly specified in this ticket must follow the approved Figma design.
