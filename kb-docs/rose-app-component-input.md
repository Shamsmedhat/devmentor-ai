# Rose App — Input Component

حقل الإدخال (Input). Label فوق الحقل دايماً، حواف rounded. بيدعم dark/light + RTL/LTR. عدد الـ variants = 9.

## Variants (9)
- **Default (Text)** — حقل نص عادي بـ placeholder.
- **Number** — أسهم stepper (▲▼) لزيادة/نقصان.
- **Search** — أيقونة بحث + زرار clear (✕) لما يكون مليان.
- **Password** — نقاط مخفية + eye toggle (إظهار/إخفاء).
- **OTP** — 6 خانات منفصلة؛ error = خانات حمرا.
- **File** — زرار "Upload file" + اسم الملف المختار + "Review current image(s)".
- **Phone** — country code selector (EG +20 بالعلم) + حقل الرقم.
- **Error state** — label + border أحمر + رسالة خطأ.
- **Disabled state** — باهت ومعطّل.

## Tokens
error = danger red-600 #DC2626 (border + label) · disabled = zinc باهت · focus ring = primary Maroon.
