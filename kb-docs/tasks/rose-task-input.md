# Rose App task — Design System: Input Component & Variants

> **ملخّص بالعربي:** تاسك الـ Input component: تعديل ملف الـ Input بتاع shadcn/ui مباشرة ودعم 7 أنواع (Text, Search, Number, File, Phone, OTP, Password) بكل الـ states في الـ light والـ dark والـ RTL/LTR.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Project setup
- Type: Story
- Priority: Medium

## User Story

As a **developer**, I want to **extend the existing shadcn/ui Input component with all required input types and states**, so that **every form input in the application is consistent and matches the approved Figma design**.

## Tasks / Features

### 1. Component Setup

- Modify the original shadcn/ui Input component file directly.
- Do not create separate component files for the input types or states described in this ticket.

### 2. Label and Accessibility

- Support an associated label for each input.
- Support placeholder text.
- Implement the appropriate accessibility attributes.
- Ensure the label and input support the error state.

### 3. Input Types

Support the following seven input types:

#### Text

- Standard text input.
- Support label, placeholder, and all required states.

#### Search

- Display a search icon.
- Show a clear (`×`) button when the field contains a value.
- Allow the user to clear the current value.

#### Number

- Support numeric input.
- Display the stepper arrows shown in Figma.
- Handle empty and invalid values appropriately.

#### File

- Support file selection.
- Display a filled state showing the selected file name.
- Support a **Preview Provided** state displaying a `Review current image(s)` link.
- Allow the user to replace the selected file.

#### Phone

- Display a country selector containing the country flag and dialing code.
- Default to Egypt (`EG`, `+20`).
- Provide a phone number input field alongside the country selector.

#### OTP

- Display six separate digit boxes.
- Support pasting a complete verification code.
- Support keyboard navigation between digit boxes.
- Accept only valid digits.

#### Password

- Mask the entered password by default.
- Display an eye icon to toggle password visibility.
- Preserve the entered value when toggling visibility.
- Ensure the visibility toggle does not submit the form.

### 4. Theme Support

- Support light and dark modes.
- Use the project's semantic color tokens exclusively.
- Do not use hardcoded color values.
- Ensure focus indicators, error states, and other visual states remain clear in both themes.

### 5. RTL/LTR Support

- Ensure icons, labels, input content, and controls are aligned correctly in both RTL and LTR layouts.
- Maintain the intended visual layout when switching between English and Arabic.

## Validation / Acceptance Criteria

### Component Structure

- The existing shadcn/ui Input component file is modified directly.
- No separate component file is created for the required input types or states.
- All seven input types are supported: Text, Search, Number, File, Phone, OTP, and Password.

### Visual States

- Default, Hovered, Focused, Error, and Disabled states match Figma.
- All states are supported in both light and dark modes.
- Focus indicators remain visible and accessible in both themes.
- The label is associated with its input and supports the error state.

### Input Behavior

- Password is masked by default.
- The password visibility toggle preserves the entered value and does not submit the form.
- Search displays the search icon and shows the clear button when filled.
- Number displays the required stepper arrows and handles empty or invalid values appropriately.
- File displays the selected file name in its filled state.
- File supports the Preview Provided state with the `Review current image(s)` link.
- The selected file can be replaced.
- Phone displays the country selector with the flag and dialing code, defaulting to Egypt (`EG`, `+20`).
- OTP supports six digits, pasted codes, and keyboard navigation.
- OTP rejects invalid characters.
- Disabled inputs do not respond to interaction.

### Design System and Compatibility

- All colors use the project's semantic design tokens.
- RTL and LTR layouts maintain correct alignment.
- The implementation is compatible with the project's existing form and validation approach.
- The component matches the approved Figma reference.

## States

### All Input Types

| State | Expected Behavior |
|---|---|
| *Default* | Displays the input in its normal state. |
| *Hovered* | Applies the hover styling specified in Figma. |
| *Focused* | Displays a clear focus indicator. |
| *Error* | Displays the appropriate error styling and supports error messaging where specified. |
| *Disabled* | Displays the disabled styling and prevents user interaction. |

### File Input - Additional States

| State | Expected Behavior |
|---|---|
| *Filled* | Displays the selected file name. |
| *Preview Provided* | Displays the `Review current image(s)` link. |

## Edge Cases

- Disabled inputs must not respond to user interaction.
- Password visibility must toggle without clearing the entered password or submitting the form.
- OTP must reject invalid characters, support pasting a complete code, and handle keyboard navigation correctly.
- Number input must handle empty and invalid values appropriately.
- Focus indicators must remain visible in light and dark modes.
- Replacing a selected file must update the displayed file state correctly.
- Search's clear button must appear only when the input contains a value and must clear the current value when activated.

## Gherkin Scenarios

### Scenario 1: Toggle Password Visibility

```gherkin
Scenario: Toggle password visibility
  Given a Password input contains a value
  When the user clicks the eye icon
  Then the password visibility toggles
  And the entered value is not cleared
  And the form is not submitted
```

### Scenario 2: Search Shows the Clear Button

```gherkin
Scenario: Search shows the clear button
  Given a Search input is empty
  When the user types a value
  Then the clear (x) button appears
```

### Scenario 3: OTP Accepts a Pasted Code

```gherkin
Scenario: OTP accepts a pasted code
  Given an OTP input with 6 digit boxes
  When the user pastes a code
  Then the code is accepted across the digit boxes
```

### Scenario 4: Disabled Input

```gherkin
Scenario: Disabled input
  Given an input is disabled
  When the user tries to interact with it
  Then it does not respond
```

## Design Reference

**Figma is the source of truth** for all visual specifications, including:

- Dimensions and spacing.
- Typography.
- Colors and semantic tokens.
- Icons and alignment.
- Component variants and states.

**Reference location:**

- **Page:** `Design System - NEW`
- **Frame:** `Components`
- **Component:** `Input`

Any requirement not explicitly specified in this ticket must follow the approved Figma design.
