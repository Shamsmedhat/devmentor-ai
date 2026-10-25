# Rose App — Design Tokens (Source of Truth)

This is the official Rose App design system, extracted from the Figma design file. When advising students on colors, fonts, spacing, borders, or styling for any Rose App component, use THESE tokens. Do NOT invent generic values or suggest unrelated palettes (e.g. indigo, violet, slate) — the Rose App brand is **Maroon + Soft Pink**, not a generic Tailwind default.

The design system supports both **LIGHT and DARK** modes. The semantic token names below are theme-agnostic: a component uses a token like `primary` or `danger`, and the theme resolves it. The values shown are the LIGHT theme; DARK mode keeps the same roles and inverts surfaces.

## Fonts

- **Primary / display font: Sarabun** (CSS variable `--font-primary`). Used for headings and UI text.
- Mulish also appears in the file as a secondary/body face.

## Semantic color tokens (use these in components)

Each intent has three steps: the solid color, a light `-faint`, and a lighter `-fade` (for tinted backgrounds and subtle fills).

| Token | Role | Maps to primitive | Hex |
|---|---|---|---|
| primary | brand / primary actions, primary buttons | maroon-800 | #501419 |
| primary-faint | tinted primary background | maroon-100 | #F3C5C7 |
| primary-fade | lightest primary background | maroon-50 | #FBEAEA |
| secondary | secondary actions / accent | soft-pink-400 | #FF85A2 |
| secondary-faint | tinted secondary background | soft-pink-100 | #FFE0E7 |
| secondary-fade | lightest secondary background | soft-pink-50 | #FFF1F5 |
| success | success / valid state | emerald-500 | #00BC7D |
| success-faint | success banner background | emerald-100 | #D0FAE5 |
| success-fade | lightest success background | emerald-50 | #ECFDF5 |
| warning | warning state | yellow-400 | #FACC15 |
| warning-faint | warning background | yellow-100 | #FEF9C3 |
| warning-fade | lightest warning background | yellow-50 | #FEFCE8 |
| danger | error / destructive state | red-600 | #DC2626 |
| danger-faint | error background | red-100 | #FEE2E2 |
| danger-fade | lightest error background | red-50 | #FEF2F2 |
| info | informational state | blue-600 | #155DFC |
| info-faint | info background | blue-100 | #DBEAFE |
| info-fade | lightest info background | blue-50 | #EFF6FF |

## Surface / text / border tones (neutrals)

These tonal steps apply to **background**, **text**, and **border** roles. Built on the Zinc neutral ramp.

| Tone | Maps to | Hex |
|---|---|---|
| plain | background → white · text/border → zinc-800 | #FFFFFF / #27272A |
| subtle | zinc-50 | #FAFAFA |
| muted | zinc-100 | #F4F4F5 |
| soft | zinc-200 | #E4E4E7 |
| default | zinc-500 | #71717A |
| inverse | background → zinc-800 · text/border → white | #27272A / #FFFFFF |
| elevated | black at 20% opacity | rgba(0,0,0,0.2) |
| overlay | black at 50% opacity | rgba(0,0,0,0.5) |

## Shadow tokens

Two families, each in three sizes. Color is always black.

- subtle: x0 y4 blur10 · opacity 7%  (subtle-lg: y4 blur18 7% · subtle-sm: y2 blur5 7%)
- soft: x0 y4 blur10 · opacity 10%  (soft-lg: y4 blur18 10% · soft-sm: y2 blur5 10%)

## Border radius

Radius is a `corner/*` token scale. Known value: `corner/extra-large` = **28px**. (Cards in the design use the extra-large radius.)

## Usage guidance for components

- **Primary buttons / brand actions** → `primary` (maroon-800, #501419). The Rose App brand color is Maroon — never indigo/violet.
- **Secondary buttons / accents** → `secondary` (soft-pink-400).
- **Input / form error state** (e.g. the Input component's error border + message) → `danger` (red-600, #DC2626); error background tints use `danger-faint`/`danger-fade`.
- **Success / valid state** (e.g. valid field, success toast) → `success` (emerald-500).
- **Warning** → `warning` (yellow-400). **Info** → `info` (blue-600).
- **Page background** → white or `subtle`; **cards/sections** → `subtle`/`muted`; **dividers/borders** → border tones (`soft`, `default`).
- `-faint` = a light tinted background for that intent (e.g. a success banner uses `success-faint` background with `success` text); `-fade` = an even lighter background.

In code, map these semantic names to the project's Tailwind v4 `@theme` tokens (e.g. `bg-primary`, `text-danger`, `border-soft`, `bg-success-faint`). Prefer the semantic token over a raw primitive so dark mode and theming keep working. The raw primitive ramps (all 50–950 steps) are in the companion doc `rose-app-color-primitives`.
