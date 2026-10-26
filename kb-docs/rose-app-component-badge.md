# Rose App — Badge Component

Badge — pill صغير (حواف مدوّرة بالكامل) من صفحة Figma **Design System - NEW**. مش success/warning/error/info/outline. الـ design فيه 3 ألوان، وكل لون له tone 1 و tone 2، في Light و Dark. المجموع 6 أشكال، وده نفس تاسك الـ Badge.

| Figma variant | Task name | الشكل |
|---|---|---|
| Primary | Accent Maroon — Tone 1 و Tone 2 | زوج maroon، واحد أقوى وواحد أفتح |
| Secondary | Soft Pink — Tone 1 و Tone 2 | زوج soft pink |
| Subtle | Neutral Grey — Tone 1 و Tone 2 | زوج رمادي محايد |

الحالات على الـ component: **Default** و **Hovered**. في الـ layers: `Primary, Default Badge (light)` و `Primary, Hovered Badge (light)`، ونفس الاتنين للـ Dark، وبنفس النمط لـ Secondary و Subtle.

بيدعم Light و Dark. الألوان تتبع الـ semantic tokens (light primary = maroon، dark primary = soft pink) مش hex متثبت على الثيم الفاتح.
