# Rose App — Sprint 1 Component Specs (from Figma)

Visual specs for the Sprint 1 design-system components, extracted from the Rose App Figma design. This complements the JIRA task docs (`sprint-1-*`, which hold acceptance criteria and behavior) and `rose-app-design-tokens` (colors/fonts/radius). Use this to know each component's **variants, states, and which tokens they use**. Every component ships **LIGHT and DARK** versions and supports **RTL/LTR**.

Token shorthand (see `rose-app-design-tokens`): primary = Maroon, danger = red-600 (#DC2626), success = emerald-500 (#00BC7D), info = blue-600, neutrals = Zinc. Hover usually = a darker step of the same color (e.g. primary hover ≈ maroon-800 #501419).

## Input

A labelled field (Label always above the field). Rounded corners. The error state turns the label and border **red** and shows an error message; the disabled state is faded/grey.

Variants (input types):
- **Text** — label + placeholder; filled shows the typed value.
- **Search** — leading search (magnifier) icon; shows a clear (✕) button when filled.
- **Number** — up/down stepper arrows on the right.
- **Select** — chevron (▾) with "Select an option".
- **Upload file** — an "Upload file" action with an upload icon on the right; when filled, shows the selected filename and a "Review current image(s)" link.
- **Phone** — a country-code selector ("EG (+20)") with a flag, plus the phone-number field.
- **OTP** — 6 separate single-character boxes; auto-advance/backspace; error state shows the boxes in red; filled shows the digit.
- **Password** — masked dots with a show/hide eye toggle.

States (apply across variants): **Default, Hover, Focus, Error** (red label + red border + message), **Disabled** (faded), **Filled** (with value).

## Button

Pill/rounded button with centered label.

Variants (style):
- **Solid / primary** — Maroon background (≈ maroon-600 #A6252A), white text.
- **Soft** — maroon-100 (#F3C5C7) background, maroon text.
- **Outline** — transparent background, maroon border + maroon text.
- **Subtle / ghost** — zinc-100 (#F4F4F5) background, dark text.
- **Plain / link** — no background or border, dark text.
- **Danger** — red background (#DC2626 / maroon-red), white text.

States: **Default, Hover** (a darker step of the variant color — primary hover ≈ maroon-800 #501419), **Disabled** (grey, faded text), **Loading** (grey with a spinner ↻).

## Checkbox

Rounded checkbox + label text.

States:
- **Unchecked** — empty rounded box.
- **Checked** — Maroon (primary) fill with a white checkmark ✓.
- **Focus** — ring/border emphasis.
- **Error** — red border + a red error message below (e.g. "You must accept terms and conditions").

## Badge

Small pill-shaped label (fully rounded).

Variants:
- **Solid** — Maroon background, white text.
- **Soft** — maroon-100 background, maroon text.
- **Subtle** — zinc (grey) background, dark text.

## Textarea

Like Input but multi-line (resizable). Label above, rounded corners.

Rows: empty (placeholder) and filled. States: **Default, Hover, Focus, Error** (red label + red border), **Disabled** (faded).

## Toast

Dismissible notification: an icon + message + a close (✕) button. Rounded.

Variants:
- **Info** — info (ⓘ) icon, neutral/zinc background ("Informative message").
- **Success** — green check (✓) icon, emerald border/accent ("Successful operation").
- **Error / Danger** — red ✕ icon, red border, light-red background ("Unsuccessful operation").

## Tabs

A segmented control. The **active** segment has a Maroon (primary) background with white text; **inactive** segments have a light background with dark text.

States: **Default, Hover** (darker maroon on the active segment), **Focus** (ring), **Disabled** (grey).

## Breadcrumb & Dropdown Menu (visual spec pending)

These two Sprint 1 components exist in Figma (Breadcrumb node 18262:8705, Dropdown Menu node 18262:8662) but their visual specs were not captured here (Figma extraction limit). For now, rely on the JIRA task doc (`sprint-1-toast-tabs-pagination-breadcrumbs`) and the Figma file directly. Standard behavior: Breadcrumb = a path of links separated by a divider with a current (non-link) last item; Dropdown Menu = a trigger that opens a list of selectable menu items, with hover/focus/disabled item states. Confirm exact variants/tokens against Figma.

## Notes

- **Select, Combobox, Pagination** appear in the Sprint 1 JIRA tasks but were **not found** as dedicated components in the current Figma design system — confirm whether they're designed elsewhere or still pending before advising students they exist in the design.
- Map every component's colors to the **semantic tokens** in `rose-app-design-tokens` (primary, danger, success, etc.) rather than hardcoding hex, so dark mode and theming keep working.
