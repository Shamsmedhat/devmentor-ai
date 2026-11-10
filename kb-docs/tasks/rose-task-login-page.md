# Rose App task — Login Page

> **ملخّص بالعربي:** تاسك صفحة Login: إيميل وكلمة مرور، Remember Me، لينك نسيت كلمة المرور، زر Loading، والتحويل بعد النجاح — مع EN/AR وRTL.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Authentication
- Type: Story
- Priority: High
- Jira: KAN-65
- Story points: 5

## User Story

As a **registered user**, I want to **log in with my email and password**, so that **I can access my account and personalized features like cart, orders, and wishlist**.

## Tasks / Features

### 1. Form header

- Header with title and subtitle.

### 2. Fields and actions

- Email input (required, email format).
- Password input (required, show/hide toggle).
- Forgot Password link → `/forgot-password`.
- Remember Me checkbox.
- Login button with loading state.
- Register footer link → `/register`.

### 3. Success navigation

- Redirect to the previous page or the homepage on success.

## Validation / Acceptance Criteria

1. Email: required, valid email format.
2. Password: required.
3. Both fields are validated before the API call.
4. All visible text has EN + AR entries; keys follow `auth.<screen>.<element>`; no hardcoded strings; RTL verified.

## Permissions

- Already logged-in users are redirected to the homepage immediately — handled by the NextAuth middleware task.

## States

| State | Expected Behavior |
|---|---|
| *Loading* | Login button shows a spinner and is disabled during the API call. |
| *Empty* | N/A |
| *Error* | "Invalid email or password" is shown below the form on a 401 response. |
| *Success* | User is redirected to the previous page or homepage; the header updates with user info. |

## Edge Cases

- Remember Me = true: session persists beyond browser close.
- Remember Me = false: session expires on browser close.
- Network error: show "Something went wrong. Please try again."

## Gherkin Scenarios

### Scenario 1: Registered user logs in successfully

```gherkin
Scenario: Registered user logs in successfully
  Given the user is on the login page with valid credentials
  When they click the Login button
  Then a loading spinner shows on the button
  And the user is redirected to the homepage
  And the header shows the user avatar / name
```

### Scenario 2: User submits with wrong credentials

```gherkin
Scenario: User submits with wrong credentials
  Given the user enters an incorrect password
  When they click the Login button
  Then "Invalid email or password" (EN) / "البريد الإلكتروني أو كلمة المرور غير صحيحة" (AR) error shown
  And the form remains visible for correction
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
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

## Design Reference

**Figma is the source of truth** for the Login page layout, fields, and states.

Any behavior or visual detail not explicitly specified in this ticket must follow the Figma design and the existing Rose App design system.
