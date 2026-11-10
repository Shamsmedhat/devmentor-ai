# Rose App task — Product Details: Product Reviews

> **ملخّص بالعربي:** تاسك الريفيوهات على صفحة المنتج: متوسط التقييم وعدد الناس اللي قيّموا، وقائمة ريفيو فيها الاسم والتاريخ والنجوم والعنوان والنص، والقائمة بتسكرول جوه المساحة اللي في Figma ومش بتكبّر الصفحة. الفورم على اليمين: Your rating بنجوم (نص نجمة مسموح، زي 1.5)، Title، Review، وزر Add Review. الضيف مش بيقدر يقيّم: الفورم وراه blur ورسالة في النص "Please login to be able to review the product" ولما يضغطها يبدأ تسجيل الدخول. الـ API: `GET /api/reviews` و`POST /api/reviews` (للداخل بس). الـ API بيطلب rating وheadline، ونص الريفيو اختياري. الـ rating في الـ API رقم صحيح من 1 لـ 5، فاسأل المينتور عن نص النجمة.

## Meta

- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Product Details
- Type: Story
- Priority: Medium

## User Story

As a **shopper**, I want to **read product reviews and add my own**, so that **I can trust what I buy and share my opinion**.

## Tasks / Features

### Summary

Show the average rating and how many people rated the product.

### Reviews list

Each review shows the person's name, the date, the star rating, the title, and the review text. The list scrolls inside the area given in Figma and never grows the page.

### Review form

The form is on the right.

- "Your rating" with stars. Half a star is allowed, for example 1.5.
- Title, Review, and the Add Review button.

### Guest

A guest cannot review. The form sits behind a background blur, with a clickable message in the middle: "Please login to be able to review the product". Clicking it starts the login flow.

## API

- `GET /api/reviews` with `productId`, `page`, and `limit`.
- `POST /api/reviews` for a logged-in user. Body: `productId`, `headline`, `content`, `rating`.
- The API requires `rating` and the title (`headline`). The review text (`content`) is optional.

## Dependencies

Needs the logged-in session and the login flow from the Authentication work.

## Open questions

Ask the mentor. Do not guess.

- The API accepts a whole-number rating from 1 to 5, but half stars are allowed in the UI. Ask whether to round or whether the backend will change.

## Design

Figma "Rose App (Enhanced)": Ratings / Product Reviews on the Product page, and the Review Form for a guest. Anything not specified here follows Figma, including light and dark mode, English and Arabic (LTR/RTL), and the loading and empty states.
