# Rose App task — NextAuth Setup & Config

> **ملخّص بالعربي:** تاسك تجهيز NextAuth (Auth.js): Credentials provider، جلسات JWT، حماية الراوتس، وSessionProvider — أساس طبقة الـ authentication لكل صفحات الدخول.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Authentication
- Type: Story
- Priority: Highest
- Jira: KAN-63
- Story points: 5

## User Story

As a **developer**, I want to **install and configure NextAuth (Auth.js) with a credentials provider, session management, and route protection**, so that **every auth page and protected route shares one secure, consistent session layer that the rest of the auth work builds on**.

## Tasks / Features

### 1. NextAuth (Auth.js) setup

- Install and configure NextAuth for the Next.js App Router.
- Wire a credentials provider to the backend login endpoint.
- Use a JWT session strategy with configurable expiry.

### 2. Route protection (proxy / middleware)

- Redirect logged-in users away from `/login`, `/register`, and `/forgot-password` to the homepage.
- Redirect guests from protected routes to `/login`, preserving a `returnUrl`.

### 3. Session access

- Wrap the app with `SessionProvider`.
- Use `useSession` on the client and `auth()` / `getServerSession` on the server.

### 4. Environment

- Add `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and provider credentials to `.env.example`.

## Validation / Acceptance Criteria

1. Successful login creates a session readable on both client and server.
2. Visiting a protected route without a session redirects to `/login` with `returnUrl`.
3. A logged-in user visiting `/login` or `/register` is redirected to the homepage.
4. The secret is loaded from env; the session token is never exposed to the client bundle.

## Permissions

- Auth pages (`/login`, `/register`, `/forgot-password`) are blocked for logged-in users (redirect to homepage).
- Protected pages are blocked for guests (redirect to `/login` with `returnUrl`).

## States

| State | Expected Behavior |
|---|---|
| *Loading* | Session status `"loading"` is handled so the UI never flashes the wrong auth state. |
| *Empty* | N/A |
| *Error* | Invalid credentials are returned to the Login form for display (handled in the Login task). |
| *Success* | Session established; the app header reflects the logged-in user. |

## Edge Cases

- An expired or invalid token is treated as logged-out and redirected to `/login`.
- `returnUrl` is preserved across the full login redirect cycle.
- Logout in one tab is reflected in other tabs on focus/refresh.

## Gherkin Scenarios

### Scenario 1: Guest opens a protected route

```gherkin
Scenario: Guest opens a protected route
  Given the user is not logged in
  When they navigate to a protected route
  Then they are redirected to /login
  And a returnUrl query param points back to the original route
```

### Scenario 2: Logged-in user opens the login page

```gherkin
Scenario: Logged-in user opens the login page
  Given the user already has a valid session
  When they navigate to /login
  Then they are redirected to the homepage
```

## i18n Translation Keys

No UI strings — setup task.

## Design Reference

**Figma is the source of truth** for any auth-shell visuals that this setup enables. Behavior in this ticket is configuration and routing; visual details follow the Rose App Figma and design system.
