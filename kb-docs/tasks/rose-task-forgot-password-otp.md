# Rose App task — Forgot Password: Step 2 (OTP Verification)

> **ملخّص بالعربي:** تاسك نسيت كلمة المرور (الخطوة 2): إدخال OTP من 6 خانات، Resend مع عدّاد 60 ثانية محفوظ في localStorage، وصلاحية الكود 10 دقائق.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Authentication
- Type: Story
- Priority: Medium
- Jira: KAN-68
- Story points: not set in Jira

## User Story

As a **user who requested a password reset**, I want to **verify my identity by entering the OTP code sent to my email**, so that **my account security is maintained and I can proceed to reset my password**.

## Tasks / Features

### 1. Header

- Main title + sub text showing a masked email (e.g. `j***@gmail.com`).

### 2. OTP input

- 6-digit OTP input (6 individual boxes, auto-advance, auto-back on backspace).

### 3. Resend

- Resend Code button: disabled for 60 seconds, countdown shown, persists through page refresh via `localStorage`.
- Contact support footer link.
- OTP expires after 10 minutes.

## Validation / Acceptance Criteria

1. OTP: 6 digits required, numeric only.
2. Invalid OTP: error shown, inputs cleared.
3. Expired OTP: error prompts the user to request a new code.
4. All visible text has EN + AR entries; keys follow `auth.<screen>.<element>`; no hardcoded strings; RTL verified.

## Permissions

- Step only accessible after completing Step 1 successfully.

## States

| State | Expected Behavior |
|---|---|
| *Loading* | Submit button spinner on the OTP verification API call. |
| *Empty* | N/A |
| *Error* | "Invalid OTP code" (EN) / "رمز التحقق غير صحيح" (AR); inputs reset for retry. |
| *Success* | Navigate to Step 3 (Reset Password). |

## Edge Cases

- OTP paste: pasting a 6-digit string fills all boxes automatically.
- Browser refresh during countdown: timer resumes from the correct remaining time.
- User requests a new code: previous OTP is invalidated.

## Gherkin Scenarios

### Scenario 1: User attempts to resend OTP within cooldown period

```gherkin
Scenario: User attempts to resend OTP within cooldown period
  Given the user just received an OTP and is on Step 2
  When they try to click 'Send a new code' within 60 seconds
  Then the Resend button is disabled
  And "Resend in {X}s" (EN) / "أعد الإرسال خلال {X} ثانية" (AR) countdown shown
```

### Scenario 2: User enters wrong OTP

```gherkin
Scenario: User enters wrong OTP
  Given the OTP input is filled with incorrect digits
  When the user submits
  Then "Invalid OTP code" (EN) / "رمز التحقق غير صحيح" (AR) error shown
  And all OTP boxes are cleared
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
| `otp.title` | Enter Verification Code | أدخل رمز التحقق |
| `otp.subtitle` | We sent a code to {email} | أرسلنا رمزاً إلى {email} |
| `otp.resend` | Send a new code | أرسل رمزاً جديداً |
| `otp.resendTimer` | Resend in {s}s | أعد الإرسال خلال {s} ثانية |
| `otp.invalid` | Invalid OTP code | رمز التحقق غير صحيح |
| `otp.expired` | Code expired. Please request a new one. | انتهت صلاحية الرمز. يرجى طلب رمز جديد. |

## Design Reference

**Figma is the source of truth** for Forgot Password Step 2 (OTP).

Any behavior or visual detail not explicitly specified in this ticket must follow the Figma design and the existing Rose App design system.
