# Rose App task — Forgot Password: Steps 1 & 3 (Email + Reset)

> **ملخّص بالعربي:** تاسك نسيت كلمة المرور (الخطوة 1 و3): إدخال الإيميل لإرسال الكود، وبعد التحقق إنشاء كلمة مرور جديدة بقواعد القوة ثم التحويل لصفحة Login مع toast.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Authentication
- Type: Story
- Priority: Medium
- Jira: KAN-67
- Story points: 11

## User Story

As a **user who forgot their password**, I want to **initiate a password reset via email and set a new password after verification**, so that **I can recover my account access securely**.

## Tasks / Features

### 1. Step 1 — Email

- Header (main + sub text).
- Email input.
- Continue button.
- Register footer link.

### 2. Step 3 — Reset password

- Header (main + sub text).
- New password input.
- Confirm password input.
- Reset button.
- Contact footer.
- Standard password strength validation on Step 3.
- Success redirects to `/login` with a toast.

## Validation / Acceptance Criteria

1. Step 1 — Email: required, valid format.
2. Step 3 — New Password: min 8 chars, uppercase, lowercase, digit, special char.
3. Step 3 — Confirm Password: must match New Password.
4. All visible text has EN + AR entries; keys follow `auth.<screen>.<element>`; no hardcoded strings; RTL verified.

## Permissions

- Steps are only accessible via a valid reset token/session; no direct URL access.

## States

| State | Expected Behavior |
|---|---|
| *Loading* | Continue and Reset buttons show a spinner during the API call. |
| *Empty* | N/A |
| *Error* | Step 1: "No account found with this email" if the email is unregistered; Step 3: inline validation errors. |
| *Success* | Step 3 success: redirect to `/login` + toast "Password reset successfully". |

## Edge Cases

- Step 3 accessed directly without a valid OTP: redirect to Step 1.
- New password same as old: show error "New password must differ from current password".

## Gherkin Scenarios

### Scenario 1: User enters unregistered email

```gherkin
Scenario: User enters unregistered email
  Given the user is on Forgot Password Step 1
  When they enter an email not in the system and click Continue
  Then "No account found with this email" (EN) / "لا يوجد حساب بهذا البريد" (AR) error shown
```

### Scenario 2: User resets password successfully

```gherkin
Scenario: User resets password successfully
  Given the user is on Step 3 after OTP verification
  When they enter matching valid passwords and click Reset Password
  Then they are redirected to /login
  And "Password reset successfully" (EN) / "تمت إعادة تعيين كلمة المرور بنجاح" (AR) toast shown
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
| `forgotPw.step1.title` | Forgot Password? | نسيت كلمة المرور؟ |
| `forgotPw.step1.subtitle` | Enter your email to receive a reset code | أدخل بريدك الإلكتروني لتلقي رمز إعادة التعيين |
| `forgotPw.step1.continue` | Continue | متابعة |
| `forgotPw.noAccount` | No account found with this email | لا يوجد حساب بهذا البريد |
| `forgotPw.step3.title` | Create New Password | إنشاء كلمة مرور جديدة |
| `forgotPw.step3.reset` | Reset Password | إعادة تعيين كلمة المرور |
| `forgotPw.step3.success` | Password reset successfully | تمت إعادة تعيين كلمة المرور بنجاح |
| `forgotPw.contact` | Need help? Contact us | تحتاج مساعدة؟ تواصل معنا |

## Design Reference

**Figma is the source of truth** for Forgot Password Steps 1 and 3.

Any behavior or visual detail not explicitly specified in this ticket must follow the Figma design and the existing Rose App design system.
