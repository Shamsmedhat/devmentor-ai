# Rose App task — Home Page: Header (Unauthenticated), Footer & Push Notifications

> **ملخّص بالعربي:** تاسك الـ Home Page: الـ Header (من غير تسجيل دخول) والـ Footer والـ Newsletter (API) ولوحة الـ Notifications والـ Push Notifications بالـ Service Worker.

## Meta
- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Home Page
- Type: Story
- Priority: Medium

## User Story

As a **user**, I want to **navigate the Rose App through a consistent header and footer and receive push notifications**, so that **I can reach the main pages and stay updated even when I am not actively using the application**.

## Scope

### In Scope

- Header (Unauthenticated variant)
- Footer
- Notifications panel
- Push notifications

### Out of Scope

- Hero, About, and other Home sections
- Responsive layouts (separate ticket)
- Authenticated header

**Note:** The Header and Footer are static (UI only), except for the newsletter email input, which uses the API.

## Tasks / Features

### 1. Header (Unauthenticated)

Implement the header according to Figma in both light and dark modes.

#### Top Bar

- Logo that links to the Home page
- Search bar
- Login button
- Wishlist
- Cart
- Notifications bell
- Language switcher (English/Arabic with LTR/RTL support)

#### Navigation Bar

Include the following navigation items, each with its corresponding icon:

- Home
- Products
- Categories
- Occasions
- Contact
- About

The active navigation item must be underlined.

#### Login Interaction

- Clicking the Login button navigates to the login page.
- Hovering over the Login button displays the Login popover.
- The popover includes:
  - Login/Register tabs
  - Email input
  - Password input
  - "Forgot your password?" link
- The popover is UI only.
- Clicking the Register tab navigates to the registration page.

### 2. Footer

Implement the footer according to Figma.

#### Brand Section

- Logo
- "Rose E-Commerce App"
- "All rights reserved"

#### Discover Our Website

Include links to:

- Home
- Products
- Categories
- Occasions
- Contact
- About
- Terms & Conditions
- Privacy Policy
- FAQs

#### Newsletter Section

- Heading: "Get 20% Off Discount Coupon"
- Email input
- Subscribe button

### 3. Newsletter Subscription

Integrate the newsletter form with the API.

**Endpoint:** `POST /api/subscriptions`

#### Requirements

- Send the email address in the request body.
- Validate the email on the client before sending the request.
- Disable the Subscribe button while the request is in progress.
- On **201 Created**:
  - Display a success Toast.
  - Reset the email field.
- On **409 Conflict**:
  - Display an error Toast.

### 4. Notifications Panel

Implement the notifications panel according to Figma.

#### Panel Header

- Title: "Notifications (N)"
- "Clear all notifications" action
- "Mark all as read" action

#### Notification List

- Display notifications retrieved from the API.
- Each notification must support a per-item menu with:
  - Mark as read
  - Delete notification
- Read notifications must appear grey.
- The "Mark as read" action must be disabled for notifications that are already read.
- Display the specified empty state when there are no notifications.

#### Notification Badge

- Display the unread notification count on the bell.
- Keep the badge synchronized with the unread count returned by the API.

### 5. Push Notifications (Frontend Only)

The backend implementation already exists. Implement the frontend integration using the browser's Web Push API and Service Worker.

#### Service Worker

- Register a Service Worker.
- Implement `push` and `notificationclick` event handlers.
- On receiving a push event, display a notification containing:
  - Title
  - Message
  - Icon
- On notification click, focus an existing application window or open a new one at the notification's `link`, even when the application is closed.

#### Push Configuration

- Retrieve the public VAPID key from the API.
- Hide the push opt-in when:
  - `GET /api/notifications/vapid-public-key` returns `404`.
  - `pushConfigured` is `false`.

#### Enabling Push Notifications

1. The user explicitly clicks the push opt-in.
1. Request browser notification permission only after that click.
1. If permission is granted, subscribe using `PushManager.subscribe`.
1. Send the subscription to the backend API.
1. Update the UI to reflect the subscription status.

#### Disabling Push Notifications

- Remove the browser's push subscription.
- Remove the corresponding server-side subscription through the API.
- Update the UI to reflect the disabled state.

#### Push Notification States

Use the existing Button and Toast components. No additional Figma frame is provided for these states.

- **Not enabled:** Push notifications are not enabled.
- **Permission denied:** Explain that the user must change the browser's notification settings.
- **Subscribed:** Push notifications are enabled.
- **Unsupported browser:** Inform the user that push notifications are not supported.
- **Not configured on the server:** Hide the opt-in entirely.
- **Error:** Display an appropriate error message.

### 6. Design System, Theme, and Internationalization

- Reuse existing design tokens and components.
- Reuse the existing:
  - Input
  - Button
  - Toast
  - Menu
  - Badge
- Do not introduce new styles.
- Support English and Arabic.
- Use the correct fonts for each language.
- Ensure the correct text direction (LTR/RTL).
- Maintain readability and sufficient contrast in both light and dark modes.

## Validation / Acceptance Criteria

### Header and Footer

- The unauthenticated Header and Footer match Figma in light and dark modes.
- All navigation links point to their respective routes. Pages that have not been implemented yet may return `404`.
- Clicking Login navigates to the login page.
- Hovering over Login displays the login popover.
- Clicking Register navigates to the registration page.
- Interactive elements display appropriate hover, focus, active, and disabled states where applicable.

### Newsletter

- The newsletter form calls the API with a valid email.
- A `201` response displays a success Toast and resets the email field.
- A `409` response displays an error Toast.
- Invalid email addresses are rejected on the client without making an API request.
- The Subscribe button is disabled while the request is in progress.

### Notifications Panel

- The panel matches Figma.
- Notifications are retrieved from and managed through the API.
- The bell badge reflects the unread notification count.
- Read notifications appear grey.
- The "Mark as read" action is disabled for already-read notifications.
- The empty state is displayed when there are no notifications.
- Mark-all-as-read, clear-all, mark-as-read, and delete actions work correctly.

### Push Notifications

- Push notifications use browser Web Push through the Service Worker and Push API.
- Browser permission is never requested on page load.
- Permission is requested only after an explicit user action.
- Users can enable and disable push notifications.
- The opt-in is hidden when push is not configured on the server.
- Received notifications display the correct title, message, and icon.
- Clicking a notification opens the correct destination.
- Notification clicks work when the application is not already open.
- Denied permissions, unsupported browsers, and subscription errors are handled gracefully.
- Only the public VAPID key is exposed to the client.

### Internationalization and Quality

- English and Arabic render with the correct fonts and text direction.
- Long translated text does not overflow the Header, Footer, or notifications panel.
- Theme changes preserve readability and contrast.
- Linting passes.
- Type-checking passes.
- The production build passes.

## Required States

### Newsletter

| State | Expected Behavior |
|---|---|
| Default | Email input and enabled Subscribe button |
| Loading | Subscribe button disabled while the request runs |
| Success (`201`) | Success Toast displayed; email field reset |
| Error (`409`) | Error Toast displayed |
| Invalid email | Submission blocked; no API request made |

### Notifications Panel

| State | Expected Behavior |
|---|---|
| With notifications | Display the notification list and available actions |
| Empty | Display the Figma-defined empty state |
| Read notification | Display the item in grey |
| Already-read notification | Disable the "Mark as read" action |

### Push Notifications

| State | Expected Behavior |
|---|---|
| Not enabled | Display the push opt-in |
| Permission denied | Explain that permission must be changed in browser settings |
| Subscribed | Indicate that push notifications are enabled |
| Unsupported browser | Explain that push notifications are unsupported |
| Not configured on the server | Hide the push opt-in |
| Error | Handle the error gracefully and inform the user |

## Edge Cases and Technical Considerations

- Permission must never be requested repeatedly or unexpectedly.
- Duplicate subscription requests must be safe; the API upserts subscriptions by endpoint.
- Notification clicks must open a valid destination even when the application is not open.
- The UI must distinguish between browser notification permission status and the application's push subscription status.
- All push endpoints, except the public VAPID key endpoint, require an authenticated user.
- Until the authentication ticket is completed, development uses a test user token.
- Service Workers require HTTPS; `localhost` is permitted for local development.
- Long translated text must not overflow the Header, Footer, or notifications panel.
- Theme changes must preserve readability and contrast.
- Never expose the private VAPID key or other secrets to the client.

## Gherkin Scenarios

### Scenario 1: User Subscribes to the Newsletter

```gherkin
Scenario: User subscribes to the newsletter
  Given the user is in the footer newsletter block
  When they enter a valid email and click Subscribe
  Then POST /api/subscriptions is called with the email
  And on 201 a success Toast is shown and the field is reset
```

### Scenario 2: Email Is Already Subscribed

```gherkin
Scenario: Email is already subscribed
  Given the user is in the footer newsletter block
  When they submit an email that is already subscribed
  Then the API returns 409
  And an error Toast is shown
```

### Scenario 3: User Enables Push Notifications

```gherkin
Scenario: User enables push notifications
  Given the browser supports Web Push and the server has push configured
  When the user clicks the push opt-in
  Then the browser asks for permission
  And once granted the subscription is sent to the API
```

### Scenario 4: Push Is Not Configured on the Server

```gherkin
Scenario: Push is not configured on the server
  Given GET /api/notifications/vapid-public-key returns 404
  Then the push opt-in is hidden
```

## API Reference

**Base URL:** `https://rose-app.elevate-bootcamp.cloud`

**Swagger Documentation:** [https://rose-app.elevate-bootcamp.cloud/api-docs/](https://rose-app.elevate-bootcamp.cloud/api-docs/)

API responses follow this structure:

- `status`
- `message`
- `payload`

**Authentication:** "User" means an authenticated user token is required.

### Newsletter

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/subscriptions` | Public | Subscribe to the newsletter. Request body: `{ "email": "user@example.com" }`. Returns `201` when subscribed or `409` when already subscribed. |

### Push Configuration and Subscriptions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications/vapid-public-key` | Public | Returns `payload.publicKey` (base64url-encoded). A `404` means push is not configured. Convert the key to a `Uint8Array` for `applicationServerKey`. |
| `GET` | `/api/notifications/push-status` | User | Returns `payload.pushConfigured`, `subscriptionCount`, and `unreadCount`. |
| `POST` | `/api/notifications/subscriptions` | User | Registers the browser subscription. Request body: `subscription.toJSON()`. Upserts by endpoint. |
| `DELETE` | `/api/notifications/subscriptions` | User | Removes the subscription. Request body: `{ "endpoint": "..." }`. |
| `POST` | `/api/notifications/test-push` | User | Development only. Sends a test push to verify the notification payload shape. This endpoint is not documented in Swagger. |

### Notification Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | User | Retrieves notifications. Supports `page`, `limit`, `type`, `isRead`, and `search` query parameters. Items include `id`, `type`, `title`, `message`, `isRead`, `link`, and `createdAt`. Pagination is provided in `payload.metadata`. |
| `GET` | `/api/notifications/unread-count` | User | Retrieves the unread notification count for the bell badge. |
| `PATCH` | `/api/notifications/[id]` | User | Marks an individual notification as read. Request body: `{ "isRead": true }`. |
| `PATCH` | `/api/notifications/mark-all-read` | User | Marks all notifications as read. |
| `DELETE` | `/api/notifications/[id]` | User | Deletes an individual notification. |
| `DELETE` | `/api/notifications/clear-all` | User | Deletes all notifications. |

**Admin-only endpoint:** `POST /api/notifications` is not used by the frontend.

## Design Reference

**Figma is the source of truth** for the Header, Footer, notifications panel, and their states.

Any behavior or visual detail not explicitly specified in this ticket must follow the Figma design and the existing Rose App design system.
