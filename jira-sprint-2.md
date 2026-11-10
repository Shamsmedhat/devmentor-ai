# Elevate Bootcamp — Rose App — Sprint 2 (KAN Sprint 2)

Project: KAN · Sprint label: `sprint-2` (Jira board has no named "KAN Sprint 2" sprint object; stories carry label `sprint-2` except KAN-68 which has no label but belongs to the Authentication epic and the C5 grading sheet "App - Sprint 2")
Epic: **KAN-62 Authentication** — Login, Register, Forgot Password · Priority: High · labels: sprint-2

This document dumps every Sprint 2 story with description, acceptance criteria, states, edge cases, Gherkin, i18n, priority, and story points as returned from Jira (read-only). Cross-checked against C5 grading sheet tab "App - Sprint 2" task names.

Design / Figma: no remote links or attachments were present on these issues in Jira. Use the approved Rose App Figma as the visual source of truth (same file as Sprint 1 / design system).

C5 grading sheet unique task names (assignment units; some students get Auth Layout + OTP combined):
- NextAuth Setup & Config
- Authentication Layout
- Login Page
- Register Page
- Forgot Password - Steps 1 & 3 (Email + Reset)
- Authentication Layout + Forgot Password - Step 2 (OTP Verification)  ← grading combo of two Jira stories

---

## Epic: Authentication (KAN-62)
Priority: High · labels: sprint-2
Description: Login, Register, Forgot Password

---

## Story: NextAuth Setup & Config (KAN-63)
Epic: Authentication · Priority: Highest · Story points: 5 · labels: sprint-2

**User story**

> As a **developer**, I want to **install and configure NextAuth (Auth.js) with a credentials provider, session management, and route protection**, so that **every auth page and protected route shares one secure, consistent session layer that the rest of the sprint builds on**.

**Tasks / Features**

* Install and configure NextAuth for the Next.js App Router
* Credentials provider wired to the backend login endpoint
* JWT session strategy with configurable expiry
* Proxy: redirect logged-in users away from /login, /register, /forgot-password to the homepage
* Proxy: redirect guests from protected routes to /login, preserving a returnUrl
* SessionProvider wrapping the app; useSession on the client, auth()/getServerSession on the server
* Environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL, provider creds) added to .env.example

**Acceptance Criteria**

1. Successful login creates a session readable on both client and server
2. Visiting a protected route without a session redirects to /login with returnUrl
3. A logged-in user visiting /login or /register is redirected to the homepage
4. Secret loaded from env; session token never exposed to the client bundle

**Permissions**

* Auth pages (/login, /register, /forgot-password) blocked for logged-in users (redirect to homepage)
* Protected pages blocked for guests (redirect to /login with returnUrl)

**States**

* **Loading:** Session status "loading" is handled so the UI never flashes the wrong auth state
* **Empty:** N/A
* **Error:** Invalid credentials are returned to the Login form for display (handled in the Login story)
* **Success:** Session established; app header reflects the logged-in user

**Edge cases**

* Expired or invalid token is treated as logged-out and redirected to /login
* returnUrl is preserved across the full login redirect cycle
* Logout in one tab is reflected in other tabs on focus/refresh

**Gherkin**

```
Scenario: Guest opens a protected route
  Given the user is not logged in
  When they navigate to a protected route
  Then they are redirected to /login
  And a returnUrl query param points back to the original route

Scenario: Logged-in user opens the login page
  Given the user already has a valid session
  When they navigate to /login
  Then they are redirected to the homepage
```

**i18n** No UI strings — setup task.

---

## Story: Authentication Layout (KAN-64)
Epic: Authentication · Priority: Highest · Story points: 3 · labels: sprint-2

**User story**

> As a **guest user**, I want to **see a clean, branded two-column authentication layout on all auth pages**, so that **the authentication experience feels consistent, professional, and on-brand**.

**Tasks / Features**

* Two-column layout: form column (left) + decorative image column (right)
* Decorative separator lines at the top and bottom of the form panel
* Language toggle button: switches locale and updates URL
* On mobile: image column hidden, form takes full width
* Dark/light mode applied to background, separators, and form panel

**Acceptance Criteria**

1. All visible text has EN + AR entries; keys follow auth.<screen>.<element>; no hardcoded strings; RTL verified.

**Permissions**

* Auth pages redirect logged-in users to homepage — handled by NextAuth middleware (KAN-63)

**States**

* **Loading:** N/A
* **Empty:** N/A
* **Error:** N/A
* **Success:** Layout renders correctly in both EN and AR, both light and dark

**Edge cases**

* RTL flips column order: form on right, image on left in Arabic
* Keyboard tab order remains logical in both directions

**Gherkin**

```
Scenario: User switches language on the login page
  Given the user is on /en/login
  When they click the language toggle button
  Then the page navigates to /ar/login
  And all text is displayed in Arabic
  And the layout switches to RTL direction
  And Tajawal font is active
```

**i18n**

| Key | EN | AR |
| --- | --- | --- |
| `auth.switchLang` | العربية | English |
| `auth.langLabel` | Switch to Arabic | التحويل إلى الإنجليزية |
| `auth.pageTitle` | Authentication | المصادقة |
| `validation.passwordWeak` | Password must be at least 8 characters with uppercase, lowercase, number, and special character | يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتشمل: حرف كبير وصغير ورقم ورمز خاص |
| `validation.passwordMatch` | Passwords do not match | كلمتا المرور غير متطابقتين |
| `error.networkError` | Something went wrong. Please try again. | حدث خطأ ما. يرجى المحاولة مجدداً. |

---

## Story: Login Page (KAN-65)
Epic: Authentication · Priority: High · Story points: 5 · labels: sprint-2

**User story**

> As a **registered user**, I want to **log in with my email and password**, so that **I can access my account and personalized features like cart, orders, and wishlist**.

**Tasks / Features**

* Header with title and subtitle
* Email input (required, email format)
* Password input (required, show/hide toggle)
* Forgot Password link → /forgot-password
* Remember Me checkbox
* Login button with loading state
* Register footer link → /register
* Redirect to previous page or homepage on success

**Acceptance Criteria**

1. Email: required, valid email format
2. Password: required
3. Both fields validated before API call
4. All visible text has EN + AR entries; keys follow auth.<screen>.<element>; no hardcoded strings; RTL verified.

**Permissions**

* Already logged-in users are redirected to homepage immediately — handled by NextAuth middleware (KAN-63)

**States**

* **Loading:** Login button shows spinner and is disabled during API call
* **Empty:** N/A
* **Error:** "Invalid email or password" shown below the form on 401 response
* **Success:** User redirected to previous page or homepage; header updates with user info

**Edge cases**

* Remember Me=true: session persists beyond browser close
* Remember Me=false: session expires on browser close
* Network error: 'Something went wrong. Please try again.' shown

**Gherkin**

```
Scenario: Registered user logs in successfully
  Given the user is on the login page with valid credentials
  When they click the Login button
  Then a loading spinner shows on the button
  And the user is redirected to the homepage
  And the header shows the user avatar / name

Scenario: User submits with wrong credentials
  Given the user enters an incorrect password
  When they click the Login button
  Then "Invalid email or password" (EN) / "البريد الإلكتروني أو كلمة المرور غير صحيحة" (AR) error shown
  And the form remains visible for correction
```

**i18n**

| Key | EN | AR |
| --- | --- | --- |
| `login.title` | Welcome Back | مرحباً بعودتك |
| `login.subtitle` | Sign in to your account | سجّل الدخول إلى حسابك |
| `login.email` | Email | البريد الإلكتروني |
| `login.password` | Password | كلمة المرور |
| `login.forgotPassword` | Forgot password? | نسيت كلمة المرور؟ |
| `login.rememberMe` | Remember me | تذكرني |
| `login.button` | Login | تسجيل الدخول |
| `login.noAccount` | Don't have an account? | ليس لديك حساب؟ |
| `login.register` | Register | إنشاء حساب |
| `login.invalidCredentials` | Invalid email or password | البريد الإلكتروني أو كلمة المرور غير صحيحة |

---

## Story: Register Page (KAN-66)
Epic: Authentication · Priority: High · Story points: 5 · labels: sprint-2

**User story**

> As a **guest user**, I want to **create a new account**, so that **I can access all features of the app as a registered user**.

**Tasks / Features**

* Header with title and subtitle
* First Name, Last Name inputs (required)
* Email input (required, unique)
* Phone input (required, phone variant)
* Gender dropdown (Male / Female only)
* Password input (required, strength validation)
* Confirm Password input (required, must match)
* Create Account button with loading state
* Login footer link

**Acceptance Criteria**

1. All fields required
2. Email: valid format, not already registered
3. Phone: valid phone number format
4. Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
5. Confirm Password: must match Password exactly
6. All visible text has EN + AR entries; keys follow auth.<screen>.<element>; no hardcoded strings; RTL verified.

**Permissions**

* Already logged-in users redirected to homepage — handled by NextAuth middleware (KAN-63)

**States**

* **Loading:** Button spinner during API call
* **Empty:** N/A
* **Error:** Email already in use: inline error on email field; server errors shown below form
* **Success:** Redirect to /login + success toast: "Account created successfully"

**Edge cases**

* Duplicate email from different case treated as same
* Phone number formatting: normalize before sending to API

**Gherkin**

```
Scenario: New user registers successfully
  Given the user fills all valid registration fields
  When they click Create Account
  Then they are redirected to the login page
  And "Account created successfully" (EN) / "تم إنشاء الحساب بنجاح" (AR) toast shown

Scenario: User registers with an already-used email
  Given the email field contains an email already registered
  When they click Create Account
  Then "Email already in use" (EN) / "البريد الإلكتروني مستخدم بالفعل" (AR) error shown on email field
```

**i18n**

| Key | EN | AR |
| --- | --- | --- |
| `register.title` | Create Account | إنشاء حساب |
| `register.firstName` | First Name | الاسم الأول |
| `register.lastName` | Last Name | اسم العائلة |
| `register.email` | Email | البريد الإلكتروني |
| `register.phone` | Phone | رقم الهاتف |
| `register.gender` | Gender | الجنس |
| `register.male` | Male | ذكر |
| `register.female` | Female | أنثى |
| `register.password` | Password | كلمة المرور |
| `register.confirmPassword` | Confirm Password | تأكيد كلمة المرور |
| `register.button` | Create Account | إنشاء حساب |
| `register.emailInUse` | Email already in use | البريد الإلكتروني مستخدم بالفعل |
| `register.success` | Account created successfully | تم إنشاء الحساب بنجاح |

---

## Story: Forgot Password - Steps 1 & 3 (Email + Reset) (KAN-67)
Epic: Authentication · Priority: Medium · Story points: 11 · labels: sprint-2

**User story**

> As a **user who forgot their password**, I want to **initiate a password reset via email and set a new password after verification**, so that **I can recover my account access securely**.

**Tasks / Features**

* Step 1: header (main + sub text), email input, Continue button, Register footer link
* Step 3: header (main + sub text), new password input, confirm password input, Reset button, Contact footer
* Standard password strength validation on Step 3
* Success redirects to /login with toast

**Acceptance Criteria**

1. Step 1 — Email: required, valid format
2. Step 3 — New Password: min 8 chars, uppercase, lowercase, digit, special char
3. Step 3 — Confirm Password: must match New Password
4. All visible text has EN + AR entries; keys follow auth.<screen>.<element>; no hardcoded strings; RTL verified.

**Permissions**

* Steps only accessible via valid reset token/session; no direct URL access

**States**

* **Loading:** Continue and Reset buttons show spinner during API call
* **Empty:** N/A
* **Error:** Step 1: "No account found with this email" if email unregistered; Step 3: inline validation errors
* **Success:** Step 3 success: redirect to /login + toast "Password reset successfully"

**Edge cases**

* Step 3 accessed directly without valid OTP: redirect to Step 1
* New password same as old: show error 'New password must differ from current password'

**Gherkin**

```
Scenario: User enters unregistered email
  Given the user is on Forgot Password Step 1
  When they enter an email not in the system and click Continue
  Then "No account found with this email" (EN) / "لا يوجد حساب بهذا البريد" (AR) error shown

Scenario: User resets password successfully
  Given the user is on Step 3 after OTP verification
  When they enter matching valid passwords and click Reset Password
  Then they are redirected to /login
  And "Password reset successfully" (EN) / "تمت إعادة تعيين كلمة المرور بنجاح" (AR) toast shown
```

**i18n**

| Key | EN | AR |
| --- | --- | --- |
| `forgotPw.step1.title` | Forgot Password? | نسيت كلمة المرور؟ |
| `forgotPw.step1.subtitle` | Enter your email to receive a reset code | أدخل بريدك الإلكتروني لتلقي رمز إعادة التعيين |
| `forgotPw.step1.continue` | Continue | متابعة |
| `forgotPw.noAccount` | No account found with this email | لا يوجد حساب بهذا البريد |
| `forgotPw.step3.title` | Create New Password | إنشاء كلمة مرور جديدة |
| `forgotPw.step3.reset` | Reset Password | إعادة تعيين كلمة المرور |
| `forgotPw.step3.success` | Password reset successfully | تمت إعادة تعيين كلمة المرور بنجاح |
| `forgotPw.contact` | Need help? Contact us | تحتاج مساعدة؟ تواصل معنا |

---

## Story: Forgot Password - Step 2 (OTP Verification) (KAN-68)
Epic: Authentication · Priority: Medium · Story points: *(not set in Jira)* · labels: *(none — inferred Sprint 2 via epic + grading sheet)*

**User story**

> As a **user who requested a password reset**, I want to **verify my identity by entering the OTP code sent to my email**, so that **my account security is maintained and I can proceed to reset my password**.

**Tasks / Features**

* Header: main title + sub text showing masked email (e.g. j***@gmail.com)
* 6-digit OTP input (6 individual boxes, auto-advance, auto-back on backspace)
* Resend Code button: disabled for 60 seconds, countdown shown, persists through page refresh via localStorage
* Contact support footer link
* OTP expires after 10 minutes

**Acceptance Criteria**

1. OTP: 6 digits required, numeric only
2. Invalid OTP: error shown, inputs cleared
3. Expired OTP: error prompts user to request new code
4. All visible text has EN + AR entries; keys follow auth.<screen>.<element>; no hardcoded strings; RTL verified.

**Permissions**

* Step only accessible after completing Step 1 successfully

**States**

* **Loading:** Submit button spinner on OTP verification API call
* **Empty:** N/A
* **Error:** "Invalid OTP code" (EN) / "رمز التحقق غير صحيح" (AR); inputs reset for retry
* **Success:** Navigate to Step 3 (Reset Password)

**Edge cases**

* OTP paste: pasting a 6-digit string fills all boxes automatically
* Browser refresh during countdown: timer resumes from correct remaining time
* User requests new code: previous OTP invalidated

**Gherkin**

```
Scenario: User attempts to resend OTP within cooldown period
  Given the user just received an OTP and is on Step 2
  When they try to click 'Send a new code' within 60 seconds
  Then the Resend button is disabled
  And "Resend in {X}s" (EN) / "أعد الإرسال خلال {X} ثانية" (AR) countdown shown

Scenario: User enters wrong OTP
  Given the OTP input is filled with incorrect digits
  When the user submits
  Then "Invalid OTP code" (EN) / "رمز التحقق غير صحيح" (AR) error shown
  And all OTP boxes are cleared
```

**i18n**

| Key | EN | AR |
| --- | --- | --- |
| `otp.title` | Enter Verification Code | أدخل رمز التحقق |
| `otp.subtitle` | We sent a code to {email} | أرسلنا رمزاً إلى {email} |
| `otp.resend` | Send a new code | أرسل رمزاً جديداً |
| `otp.resendTimer` | Resend in {s}s | أعد الإرسال خلال {s} ثانية |
| `otp.invalid` | Invalid OTP code | رمز التحقق غير صحيح |
| `otp.expired` | Code expired. Please request a new one. | انتهت صلاحية الرمز. يرجى طلب رمز جديد. |
