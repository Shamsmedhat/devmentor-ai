# Rose App — Sprint 1 Component Specs (from Figma)

Visual specs for the Sprint 1 design-system components, extracted from the Rose App Figma design. This complements the JIRA task docs (`sprint-1-*`, which hold acceptance criteria and behavior) and `rose-app-design-tokens` (colors/fonts/radius). Use this to know each component's **variants, states, and which tokens they use**. Every component ships **LIGHT and DARK** versions and supports **RTL/LTR**.

Token shorthand (see `rose-app-design-tokens`): light primary = maroon-800, light secondary = soft-pink-400, light danger = red-600. Dark primary = soft-pink-300 and dark secondary = maroon-600. Fonts: Sarabun (en) and Tajawal (ar).

## Input

A labelled field (Label always above the field). Rounded corners. The error state turns the label and border **red** and shows an error message; the disabled state is faded/grey.

Types (7). Error and Disabled are states, not extra types. Select is its own component, not an Input type.

- **Text** — label + placeholder; filled shows the typed value.
- **Search** — leading search icon; shows a clear (✕) button when filled.
- **Number** — up/down stepper arrows.
- **File** — an "Upload file" action; when filled, shows the filename and a "Review current image(s)" link.
- **Phone** — a country-code selector ("EG (+20)") with a flag, plus the phone-number field.
- **OTP** — 6 separate single-character boxes; error state shows the boxes in the danger color.
- **Password** — masked dots with a show/hide eye toggle.

States: **Default, Hovered, Focused, Error, Disabled**, plus **Filled** where a value is shown.

## Button

Pill/rounded button with centered label.

Figma variants (task name in parentheses):

- **Primary** (Solid Maroon) — light: maroon-800, white text. Dark: soft-pink-300.
- **Secondary** (Soft Pink) — light: soft-pink-400. Dark: maroon-600.
- **Outline** — transparent background, primary border and text.
- **Subtle** (Neutral) — neutral zinc fill, dark text.
- **Ghost** (Text-only) — no background or border.
- **Destructive** (Destructive Red) — danger red, white text.

States: **Default, Hovered, Disabled, Loading**.

## Checkbox

Rounded checkbox + label text.

States:
- **Unchecked** — empty rounded box.
- **Checked** — theme `primary` fill with a white checkmark ✓ (light maroon-800, dark soft-pink-300).
- **Focus** — ring/border emphasis.
- **Error** — red border + a red error message below (e.g. "You must accept terms and conditions").

## Badge

Small pill-shaped label (fully rounded).

Three Figma variants, each with two tones, in light and dark (the task's six badges):

- **Primary** — Accent Maroon, tone 1 and tone 2.
- **Secondary** — Soft Pink, tone 1 and tone 2.
- **Subtle** — Neutral Grey, tone 1 and tone 2.

States on the component: **Default** and **Hovered**. There is no success/warning/info/outline badge in this page.

## Textarea

Like Input but multi-line (resizable). Label above, rounded corners.

Rows: empty (placeholder) and filled. States: **Default, Hover, Focus, Error** (red label + red border), **Disabled** (faded).

## Toast

Dismissible notification: an icon + message + a close (✕) button. Rounded.

Variants (light and dark). There is no Warning toast on this page.

- **Informative** — "Informative message", `info` color.
- **Successful** — "Successful operation", `success` (emerald-500).
- **Unsuccessful** — "Unsuccessful operation", `danger`.

## Tabs

A segmented control. The **active** segment uses the theme `primary` (light maroon-800 with white text, dark soft-pink-300). **Inactive** segments use the neutral surface.

States: **Default, Hover** (darker maroon on the active segment), **Focus** (ring), **Disabled** (grey).

## Dropdown, Select, Menu, Pagination, Breadcrumb

These exist on **Design System - NEW**, each with light and dark:

- **Dropdown** — the Figma name. The sprint task implements it as a searchable Combobox (Popover + Command). There is no layer named Combobox.
- **Select** — `Select (light)` and `Select (dark)`, placeholder "Select an option".
- **Menu** — `Menu (light)` and `Menu (dark)`.
- **Pagination** — page numbers plus First, Prev, Next, Last icons. Light and dark.
- **Breadcrumb** — `Breadcrumb (light)` and `Breadcrumb (dark)`.

## Notes

- Map colors to the semantic tokens in `rose-app-design-tokens`. Light and dark resolve `primary` and `secondary` to different ramps.
- Fonts on this page are Sarabun (English) and Tajawal (Arabic), not Mulish.
