# Sprint 1 — Dropdown (Combobox), Select & Menu Components

## Meta
- Project: Rose App — Jira project "new-rose-app" (key NRA)
- Sprint: NRA Sprint 1
- Jira issue: NRA-6 (Story)

## Story: Design System — Dropdown (Combobox), Select & Menu
- Epic: NRA-2 — Project setup
- Priority: Medium

### User story
As a developer, I want to implement reusable Dropdown (Combobox), Select, and Menu components that match the approved Figma design system, so that users can search and select options or access menu actions through consistent, accessible interactions.

### Tasks
- Dropdown (Combobox): Implement a searchable dropdown with:
  - Search input and dynamic option filtering.
  - Case-insensitive partial-match search.
  - Selected-value display.
  - Keyboard navigation and selection.
  - Open/close behavior, including outside-click dismissal and Escape handling.
  - Loading, empty, and error states for asynchronous options.
  - Support for disabled options and controlled values.
- Select: Implement a single-select component with:
  - Placeholder and selected-value display.
  - Options list and selection behavior.
  - Disabled options and appropriate keyboard interactions.
  - Required-field validation compatibility.
- Menu: Implement a reusable menu for displaying actions or navigation items, including:
  - Menu trigger and options panel.
  - Item selection and action handling.
  - Hovered, selected, and disabled item states.
  - Keyboard navigation and appropriate dismissal behavior.
- Component States: Implement the following visual states where applicable:
  - Default
  - Selected
  - Hovered
- Theme Support: Ensure all three components support light and dark modes using the project's semantic color tokens.
- Internationalization: Support English and Arabic, including RTL/LTR layouts and localized search and empty-state messages.
- Design Consistency: Match the approved Figma design for colors, typography, spacing, dimensions, icons, borders, and interaction states.

### Acceptance criteria
1. Dropdown (Combobox), Select, and Menu are implemented as three distinct component types.
2. Combobox search filters options by case-insensitive partial matches.
3. Typing in the Combobox search field updates the displayed options without changing the selected value until an option is chosen.
4. Selecting an option updates the selected value and closes the dropdown where appropriate.
5. Combobox supports asynchronous loading, empty results, and request-error states.
6. Combobox supports keyboard navigation, Enter to select, Escape to close, and outside-click dismissal.
7. Select supports single selection, placeholder display, disabled options, and form validation integration.
8. Menu items support selection or action execution, as appropriate, and disabled items cannot be activated.
9. Default, selected, and hovered states match the Figma specifications.
10. All components support light and dark modes using semantic color tokens.
11. All components support RTL/LTR layouts and accessible keyboard interactions.
12. Components remain compatible with controlled state and the project's existing form and validation architecture.

### States
- Default: Standard trigger or option appearance.
- Selected: Clearly identifies the selected option or active menu item where applicable.
- Hovered: Applies the designated hover styling to interactive elements.
- Loading (Combobox): Displays a loading indicator while options are fetched.
- Empty (Combobox): Displays a localized message when no options match the search.
- Error (Combobox): Displays an appropriate message when loading options fails.
- Disabled: Prevents interaction with disabled triggers or options.

### Edge cases
- Search must handle partial matches, letter casing, and empty queries.
- Async search must prevent stale responses from replacing newer results.
- Disabled options must not be selectable and should be skipped during keyboard navigation.
- Escape closes the Combobox and resets its search query according to the agreed behavior.
- Clicking outside an open panel closes it without triggering unintended actions.
- Empty datasets and failed requests must be handled gracefully.
- Long option labels must not break the dropdown layout.
- Components must manage focus correctly and avoid conflicting state across multiple instances.
- Theme switching and RTL/LTR layouts must preserve the correct visual states and alignment.

### i18n (Key / EN / AR)
| Key | EN | AR |
|---|---|---|
| select.placeholder | Select an option | اختر خياراً |
| select.search | Search... | بحث... |
| select.noOptions | No options found | لا توجد خيارات |
| select.loading | Loading options... | جارٍ تحميل الخيارات... |
| select.error | Failed to load options | فشل تحميل الخيارات |

### Design reference
Use the approved Rose App Figma design system as the source of truth for dimensions, typography, spacing, colors, icons, and interaction states.

Customize the existing shadcn/ui primitives where applicable, preserving compatibility with the project's architecture, semantic color tokens, theme configuration, and internationalization setup.
