# Rose App — Design Tokens (Source of Truth)

This is the official Rose App design system, taken from the Figma page **Design System - NEW**. When advising students on colors, fonts, spacing, borders, or styling for any Rose App component, use THESE tokens. Do NOT invent generic values or suggest unrelated palettes (e.g. indigo, violet, slate). The brand ramps are **Maroon** and **Soft Pink**.

Semantic names (`primary`, `danger`, …) are what components use. Light and dark resolve those names to different primitives. Do not reuse a light hex in dark mode.

## Fonts

From the Fonts frame on Design System - NEW. There is no Mulish in this page.

- **English (`en`): Sarabun.**
- **Arabic (`ar`): Tajawal.**
- Both faces use the same size scale: 72, 60, 48, 36, 30, 24, 20, 18, 16, 14, 12.
- Weights on that scale: **Regular** and **Medium**.

## Semantic colors — LIGHT

Each intent has the solid color, a `-faint` tint, and a lighter `-fade`.

| Token | Role | Maps to | Hex |
|---|---|---|---|
| primary | brand / primary actions | maroon-800 | #501419 |
| primary-faint | tinted primary background | maroon-100 | #F3C5C7 |
| primary-fade | lightest primary background | maroon-50 | #FBEAEA |
| secondary | secondary actions / accent | soft-pink-400 | #FF85A2 |
| secondary-faint | tinted secondary background | soft-pink-100 | #FFE0E7 |
| secondary-fade | lightest secondary background | soft-pink-50 | #FFF1F5 |
| success | success / valid state | emerald-500 | #00BC7D |
| success-faint | success tint | emerald-100 | #D0FAE5 |
| success-fade | lightest success background | emerald-50 | #ECFDF5 |
| warning | warning state | yellow-400 | #FACC15 |
| warning-faint | warning tint | yellow-100 | #FEF9C3 |
| warning-fade | lightest warning background | yellow-50 | #FEFCE8 |
| danger | error / destructive state | red-600 | #DC2626 |
| danger-faint | error tint | red-100 | #FEE2E2 |
| danger-fade | lightest error background | red-50 | #FEF2F2 |
| info | informational state | blue-600 | #155DFC |
| info-faint | info tint | blue-100 | #DBEAFE |
| info-fade | lightest info background | blue-50 | #EFF6FF |

### Light surfaces

Background, text, and border do **not** share one zinc step.

**Background**

| Tone | Maps to | Hex |
|---|---|---|
| plain | white | #FFFFFF |
| subtle | zinc-50 | #FAFAFA |
| muted | zinc-100 | #F4F4F5 |
| soft | zinc-200 | #E4E4E7 |
| default | zinc-500 | #71717A |
| inverse | zinc-800 | #27272A |
| elevated | black at 20% | rgba(0,0,0,0.2) |
| overlay | black at 50% | rgba(0,0,0,0.5) |

**Text:** `plain` is zinc-800 (#27272A). `primary` text is maroon-800 (#501419).

**Border** (its own row on the Light board):

| Tone | Maps to | Hex |
|---|---|---|
| muted | zinc-200 | #E4E4E7 |
| soft | zinc-300 | #D4D4D8 |
| default | zinc-400 | #A1A1AA |
| inverse | white | #FFFFFF |

## Semantic colors — DARK

Dark does not invert the light hexes. Primary and secondary swap ramps: primary becomes Soft Pink, secondary becomes Maroon.

**Text intents** (read from SEMANTIC COLORS - DARK → TEXT):

| Token | Maps to | Hex |
|---|---|---|
| primary | soft-pink-300 | #FFA3B9 |
| primary-faint | soft-pink-300 at 75% | #FFA3B9 / 75% |
| primary-fade | soft-pink-300 at 25% | #FFA3B9 / 25% |
| secondary | maroon-600 | #A6252A |
| secondary-faint | maroon-600 at 50% | #A6252A / 50% |
| secondary-fade | maroon-600 at 25% | #A6252A / 25% |
| success | emerald-500 | #00BC7D |
| success-faint | emerald-500 at 50% | #00BC7D / 50% |
| success-fade | emerald-500 at 25% | #00BC7D / 25% |
| warning | yellow-500 | #EAB308 |
| warning-faint | yellow-500 at 50% | #EAB308 / 50% |
| warning-fade | yellow-50 | #FEFCE8 |
| danger | red-500 | #EF4444 |
| danger-faint | red-500 | #EF4444 |
| danger-fade | red-50 | #FEF2F2 |
| info | blue-500 | #2B7FFF |
| info-faint | blue-900 | #1C398E |
| info-fade | blue-500 at 25% | #2B7FFF / 25% |

**Background** also has `primary-saturated` = soft-pink-200 (#FFC2D0). Background `primary` is soft-pink-300, `primary-faint` is soft-pink-300/75, and `primary-fade` is soft-pink-300/25.

**Background neutrals (dark)**

| Tone | Maps to | Hex |
|---|---|---|
| plain | zinc-700 | #3F3F46 |
| subtle | zinc-800 | #27272A |
| muted | zinc-900 | #18181B |
| default | zinc-600 | #52525B |
| inverse | zinc-50 | #FAFAFA |
| elevated | black at 20% | rgba(0,0,0,0.2) |
| overlay | black at 50% | rgba(0,0,0,0.5) |

**Text neutrals (dark):** `plain` zinc-50 (#FAFAFA), `subtle` zinc-300 (#D4D4D8), `muted` zinc-400 (#A1A1AA).

## Shadow tokens

Two families, each in three sizes. Color is always black.

- subtle: x0 y4 blur10 · opacity 7%  (subtle-lg: y4 blur18 7% · subtle-sm: y2 blur5 7%)
- soft: x0 y4 blur10 · opacity 10%  (soft-lg: y4 blur18 10% · soft-sm: y2 blur5 10%)

## Border radius

Radius is a `corner/*` token scale. Known value: `corner/extra-large` = **28px**. (Cards in the design use the extra-large radius.)

## Usage guidance for components

- **Primary button, light** → `primary` maroon-800 (#501419), white text. **Primary button, dark** → dark `primary` soft-pink-300 (#FFA3B9).
- **Secondary button, light** → `secondary` soft-pink-400 (#FF85A2). **Secondary button, dark** → dark `secondary` maroon-600 (#A6252A).
- **Input / form error** → `danger`. Light danger is red-600 (#DC2626). Dark danger text is red-500 (#EF4444).
- **Success** → emerald-500 in both themes. **Warning** is yellow-400 in light and yellow-500 in dark. **Info** is blue-600 in light and blue-500 in dark.
- **Page background** → `plain` or `subtle`. **Borders** → the border scale (`soft`, `default`), not the background scale.
- `-faint` and `-fade` are the tint steps. In dark mode several of them are the solid color at 75%, 50%, or 25% opacity.

In code, map semantic names to Tailwind v4 `@theme` tokens (`bg-primary`, `text-danger`, `border-soft`, `bg-success-faint`). Prefer the semantic token over a raw primitive so light and dark stay in sync. Primitive ramps (50–950) are in `rose-app-color-primitives`.
