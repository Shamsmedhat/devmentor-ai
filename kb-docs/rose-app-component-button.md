# Rose App — Button Component

زرار المشروع (Button) من صفحة Figma **Design System - NEW**. فيه 6 variants، وكل واحد Light و Dark. الحالات على كل variant: **Default**، **Hovered**، **Disabled**، **Loading**.

أسماء الـ property في Figma، وقدامها الاسم اللي التاسك بتستخدمه:

| Figma variant | Task name | Light | Dark |
|---|---|---|---|
| Primary | Solid Maroon | maroon-800 `#501419`، نص أبيض | soft-pink-300 `#FFA3B9` (dark primary) |
| Secondary | Soft Pink | soft-pink-400 `#FF85A2` | maroon-600 `#A6252A` (dark secondary) |
| Outline | Outline | خلفية شفافة + border ونص من primary | نفس الفكرة بـ dark primary |
| Subtle | Neutral | خلفية zinc محايدة، نص غامق | النسخة الداكنة من نفس الـ neutral |
| Ghost | Text-only | من غير خلفية ومن غير border | نفس الفكرة على الخلفية الداكنة |
| Destructive | Destructive Red | danger أحمر، نص أبيض | dark danger (red-500 `#EF4444`) |

## States

- **Default** — الشكل العادي.
- **Hovered** — درجة أغمق من نفس الـ variant.
- **Disabled** — باهت ومش قابل للتفاعل.
- **Loading** — spinner جنب الـ label، والزرار مش بيتداس تاني.

الألوان من الـ semantic tokens في `rose-app-design-tokens`، مش hex ثابت، عشان Light و Dark يفضلوا مظبوطين. بيدعم RTL/LTR.
