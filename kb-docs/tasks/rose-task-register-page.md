# Rose App task — Register Page

> **ملخّص بالعربي:** تاسك صفحة Register: الاسم، الإيميل، الموبايل، الجنس، كلمة المرور وتأكيدها بقواعد القوة، وtoast النجاح مع التحويل لصفحة Login.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Authentication
- Type: Story
- Priority: High
- Jira: KAN-66
- Story points: 5

## User Story

As a **guest user**, I want to **create a new account**, so that **I can access all features of the app as a registered user**.

## Tasks / Features

### 1. Form header

- Header with title and subtitle.

### 2. Fields

- First Name and Last Name inputs (required).
- Email input (required, unique).
- Phone input (required, phone variant).
- Gender dropdown (Male / Female only).
- Password input (required, strength validation).
- Confirm Password input (required, must match).

### 3. Actions

- Create Account button with loading state.
- Login footer link.

## Validation / Acceptance Criteria

1. All fields are required.
2. Email: valid format, not already registered.
3. Phone: valid phone number format.
4. Password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char.
5. Confirm Password: must match Password exactly.
6. All visible text has EN + AR entries; keys follow `auth.<screen>.<element>`; no hardcoded strings; RTL verified.

## Permissions

- Already logged-in users are redirected to the homepage — handled by the NextAuth middleware task.

## States

| State | Expected Behavior |
|---|---|
| *Loading* | Button spinner during the API call. |
| *Empty* | N/A |
| *Error* | Email already in use: inline error on the email field; server errors shown below the form. |
| *Success* | Redirect to `/login` + success toast: "Account created successfully". |

## Edge Cases

- Duplicate email from different case (e.g. `Test@email.com` vs `test@email.com`) is treated as the same.
- Phone number formatting: normalize before sending to the API.

## Gherkin Scenarios

### Scenario 1: New user registers successfully

```gherkin
Scenario: New user registers successfully
  Given the user fills all valid registration fields
  When they click Create Account
  Then they are redirected to the login page
  And "Account created successfully" (EN) / "تم إنشاء الحساب بنجاح" (AR) toast shown
```

### Scenario 2: User registers with an already-used email

```gherkin
Scenario: User registers with an already-used email
  Given the email field contains an email already registered
  When they click Create Account
  Then "Email already in use" (EN) / "البريد الإلكتروني مستخدم بالفعل" (AR) error shown on email field
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
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

## Design Reference

**Figma is the source of truth** for the Register page layout, fields, and states.

Any behavior or visual detail not explicitly specified in this ticket must follow the Figma design and the existing Rose App design system.
