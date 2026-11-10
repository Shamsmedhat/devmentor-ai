# Rose App — Sprint 2 plan (السبرنت الثاني)

> **ملخّص بالعربي:** السبرنت الثاني (Sprint 2) في مشروع Rose App في ايليفيت (Elevate Tech) فيه 6 تاسكات كلها تحت Epic الـ Authentication: تجهيز NextAuth، الـ Authentication Layout، صفحة Login، صفحة Register، نسيت كلمة المرور (خطوة 1 و3: الإيميل + إعادة التعيين)، ونسيت كلمة المرور (خطوة 2: OTP). توزيع التاسكات على الطلبة ممكن يختلف من جروب للتاني (مثلاً بعض الطلبة بياخدوا الـ Layout مع الـ OTP مع بعض في ورقة التصحيح).

Sprint 2 of the Rose App website (Elevate Tech bootcamp). This is the current plan: a cohort may move a task to a later sprint or add a new one. The task content itself lives in each task document.

## Tasks in Sprint 2 (6 tasks)

1. **NextAuth Setup & Config** (epic: Authentication) - NextAuth / Auth.js، Credentials provider، جلسات JWT، حماية الراوتس، وSessionProvider.
2. **Authentication Layout** (epic: Authentication) - تخطيط عمودين (فورم + صورة)، فواصل ديكور، زر اللغة، موبايل بدون صورة، Light/Dark وRTL/LTR.
3. **Login Page** (epic: Authentication) - إيميل وكلمة مرور، Remember Me، لينك نسيت كلمة المرور، Loading، والتحويل بعد النجاح.
4. **Register Page** (epic: Authentication) - الاسم، الإيميل، الموبايل، الجنس، كلمة المرور وتأكيدها، وtoast النجاح.
5. **Forgot Password — Steps 1 & 3 (Email + Reset)** (epic: Authentication) - إدخال الإيميل لإرسال الكود، ثم إنشاء كلمة مرور جديدة بعد التحقق.
6. **Forgot Password — Step 2 (OTP Verification)** (epic: Authentication) - OTP من 6 خانات، Resend بعد 60 ثانية، وصلاحية الكود 10 دقائق.

## Epics

- **Authentication:** NextAuth session layer, shared auth layout, Login, Register, and the full Forgot Password flow (email → OTP → reset).
