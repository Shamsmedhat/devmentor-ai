# Rose App — Input Component

حقل الإدخال (Input) من صفحة Figma **Design System - NEW**. Label فوق الحقل، حواف rounded. بيدعم Light/Dark و RTL/LTR.

الأنواع 7، مش 9. Error و Disabled حالات على النوع، مش أنواع لوحدها.

## Types (7)

- **Text** — حقل نص بـ placeholder، والـ filled بيظهر القيمة.
- **Search** — أيقونة بحث، وزرار clear (✕) لما يكون مليان.
- **Number** — أسهم stepper.
- **File** — "Upload file"، وبعد الاختيار اسم الملف و "Review current image(s)".
- **Phone** — country code (EG +20 بالعلم) + حقل الرقم.
- **OTP** — 6 خانات منفصلة.
- **Password** — نقاط مخفية + eye toggle.

## States

على كل نوع: **Default**، **Hovered**، **Focused**، **Error**، **Disabled**. وفيه **Filled** للأنواع اللي بتظهر قيمة (زي Search).

Error: label + border من `danger` (light: red-600 `#DC2626`، dark: red-500 `#EF4444`) + رسالة. OTP في الـ error خاناته باللون ده. Disabled باهت. Focus ring من `primary` بتاع الثيم (light maroon-800، dark soft-pink-300).
