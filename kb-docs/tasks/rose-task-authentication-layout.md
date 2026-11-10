# Rose App task — Authentication Layout

> **ملخّص بالعربي:** تاسك الـ Authentication Layout: صفحة الدخول بعمودين (فورم + صورة)، فواصل ديكور، زر تغيير اللغة، إخفاء الصورة على الموبايل، ودعم Light/Dark وRTL/LTR.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Authentication
- Type: Story
- Priority: Highest
- Jira: KAN-64
- Story points: 3

## User Story

As a **guest user**, I want to **see a clean, branded two-column authentication layout on all auth pages**, so that **the authentication experience feels consistent, professional, and on-brand**.

## Tasks / Features

### 1. Two-column layout

- Form column on the left and decorative image column on the right (LTR).
- Decorative separator lines at the top and bottom of the form panel.

### 2. Language toggle

- Language toggle button switches locale and updates the URL.

### 3. Responsive behavior

- On mobile: hide the image column; the form takes full width.

### 4. Theme

- Apply dark/light mode to the background, separators, and form panel.

## Validation / Acceptance Criteria

1. All visible text has EN + AR entries; keys follow `auth.<screen>.<element>`; no hardcoded strings; RTL verified.

## Permissions

- Auth pages redirect logged-in users to the homepage — handled by the NextAuth middleware task.

## States

| State | Expected Behavior |
|---|---|
| *Loading* | N/A |
| *Empty* | N/A |
| *Error* | N/A |
| *Success* | Layout renders correctly in both EN and AR, and in both light and dark modes. |

## Edge Cases

- RTL flips column order: form on the right, image on the left in Arabic.
- Keyboard tab order remains logical in both directions.

## Gherkin Scenarios

### Scenario 1: User switches language on the login page

```gherkin
Scenario: User switches language on the login page
  Given the user is on /en/login
  When they click the language toggle button
  Then the page navigates to /ar/login
  And all text is displayed in Arabic
  And the layout switches to RTL direction
  And Tajawal font is active
```

## i18n Translation Keys

| Key | English (EN) | Arabic (AR) |
|---|---|---|
| `auth.switchLang` | العربية | English |
| `auth.langLabel` | Switch to Arabic | التحويل إلى الإنجليزية |
| `auth.pageTitle` | Authentication | المصادقة |
| `validation.passwordWeak` | Password must be at least 8 characters with uppercase, lowercase, number, and special character | يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتشمل: حرف كبير وصغير ورقم ورمز خاص |
| `validation.passwordMatch` | Passwords do not match | كلمتا المرور غير متطابقتين |
| `error.networkError` | Something went wrong. Please try again. | حدث خطأ ما. يرجى المحاولة مجدداً. |

## Design Reference

**Figma is the source of truth** for the authentication layout, separators, decorative image, and theme states.

Any behavior or visual detail not explicitly specified in this ticket must follow the Figma design and the existing Rose App design system.
