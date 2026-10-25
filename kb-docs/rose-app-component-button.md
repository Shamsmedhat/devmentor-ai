# Rose App — Button Component

زرار المشروع (Button). الـ variant names بتتبع الـ Sprint 1 task spec (اللي الطلبة بيكوّدوا بيها)، والألوان من الـ design tokens (primary = Maroon).

## Variants
- **Primary** — solid Maroon (primary / maroon-800 #501419)، نص أبيض. الزرار الأساسي للأكشنز الرئيسية.
- **Secondary** — fill ثانوي (soft/muted)، للأكشنز البديلة.
- **Outline** — خلفية شفافة + border Maroon + نص Maroon.
- **Ghost** — شفاف تماماً، من غير border، tint عند الـ hover بس.
- **Destructive** — danger أحمر (red-600 #DC2626)، نص أبيض. للحذف/الأكشنز الخطيرة.

## States
- **Default** · **Hover** (درجة أغمق) · **Disabled** (باهت + مش قابل للتفاعل) · **Loading** (spinner + معطّل).
- **Icon** — أيقونة على اليمين أو الشمال.

## Tokens
primary = maroon-800 #501419 (hover درجة أغمق) · destructive = red-600 #DC2626 · بيدعم dark/light + RTL/LTR.
