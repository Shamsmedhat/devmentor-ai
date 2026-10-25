# Sprint 1 — Input Component & Variants

## Meta
- Project: Rose App — Jira project "new-rose-app" (key NRA)
- Sprint: NRA Sprint 1
- Jira issue: NRA-3 (Story)

## Story: Input Design System — Input Component & Variants
- Epic: NRA-2 — Project setup
- Priority: Medium
- Original estimate: 12h

### User story
As a developer, I want to implement a comprehensive, reusable Input component with all required input types, labels, interaction states, and theme support, so that all form inputs across the application follow a consistent design system and match the Figma specifications.

### Tasks
- Component Setup: Extend the existing shadcn/ui Input component by modifying its original component file directly. All required variants and behaviors must be implemented within the existing component file without creating a separate component file.
- Label & Input: Support a label associated with the input, placeholder text, and appropriate accessibility attributes.
- Input Types: Support the following input types and variants:
  - Text
  - Placeholder
  - Search
  - Number
  - File Upload
  - Phone Number
  - OTP (One-Time Password)
  - Password
- Password Input: Keep the password hidden by default and provide an eye icon to toggle password visibility.
- Search Input: Include a search icon and support the appropriate search input state.
- File Upload: Support file selection and a visual filled state when a file has been selected.
- OTP Input: Support OTP entry with appropriate input behavior and visual states.
- Interaction States: Implement all required states:
  - Default
  - Hovered
  - Focused
  - Error
  - Disabled
  - Filled (for file upload)
  - Search state (for search inputs)
- Theme Support: Ensure all input variants and states support both dark and light modes using the project's semantic color tokens.
- Design Consistency: Follow the Figma specifications for dimensions, spacing, typography, icons, borders, and colors.

### Acceptance criteria
1. All required input types and variants are supported by the existing shadcn/ui Input component.
2. The label is correctly associated with its input and supports required and error states where applicable.
3. Password inputs are masked by default, and the eye icon toggles between visible and hidden password states.
4. Search inputs display a search icon and support the required search behavior.
5. Number inputs accept numeric values and use the appropriate input behavior.
6. File upload inputs allow file selection and display a clear filled state when a file is selected.
7. Phone inputs support phone number entry and the required visual design.
8. OTP inputs support the required number of digits, keyboard navigation, and appropriate input behavior.
9. All inputs display the correct default, hover, focused, error, and disabled states as applicable.
10. File upload and search inputs display their specific states correctly.
11. All input variants and interaction states work correctly in both light and dark modes.
12. All colors use the project's semantic design tokens instead of hardcoded color values.
13. The existing shadcn/ui Input component file is modified directly; no separate component file is created for these variants or behaviors.
14. The implementation follows the existing project conventions and matches the approved Figma design.

### States
- Default: Displays the input with its standard border, background, text, and placeholder styles.
- Hovered: Applies the designated hover styling when the pointer moves over the input.
- Focused: Displays the appropriate focus border or ring when the input receives focus.
- Error: Displays the error border and supports an error message below the input.
- Disabled: Prevents user interaction and applies the disabled visual styling.
- Filled (File Upload): Displays the selected file information and the corresponding filled-state design.
- Search: Displays the search icon and the appropriate search-input styling.
- Password Visibility: Keeps the password hidden by default and allows users to reveal or hide it using the eye icon.
- OTP: Displays the appropriate appearance for empty, focused, filled, and invalid OTP input states.

### Edge cases
- Password visibility must toggle without clearing the entered password or unexpectedly submitting the form.
- Disabled inputs must not respond to user interaction.
- File upload must handle the selected file state and allow the user to select a replacement file.
- OTP input must handle pasted codes, prevent invalid characters where applicable, and support keyboard navigation.
- Number inputs must handle empty values and invalid numeric input appropriately.
- Error messages must remain accessible and correctly associated with their inputs.
- Icons and input content must remain correctly aligned in both LTR and RTL layouts.
- Focus indicators must remain visible in both light and dark modes.
- Input states must not rely on hardcoded colors that conflict with the project's semantic color system.
- All variants must remain compatible with the existing forms and validation approach used by the project.

### Design reference
Use the approved Figma design system as the source of truth for input dimensions, typography, spacing, colors, icons, and interaction states.

Implementation must modify the existing shadcn/ui Input component directly, preserving compatibility with the project's current component architecture.
