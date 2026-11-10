# Rose App task — Cart Page: Summary & Products You May Like

> **ملخّص بالعربي:** تاسك ملخص السلة: على يمين صفحة الـ Cart خانة Coupon Code وزر Apply Coupon، ومكان للكوبونات المطبّقة ("No coupons applied" لو مفيش)، وSubtotal وTotal. زر Checkout يفتح صفحة Checkout فاضية لأن بناء الصفحة دي تاسك لاحقة. تحت السلة كاروسيل Products You May Like والمنتجات بتعتمد على المستخدم، وبنفس الكاروسيل بتاع Related Products. Swagger فيه بس `GET /api/coupons` و`GET /api/coupons/<id>` ومفيش endpoint للتطبيق، فاسأل المينتور قبل ما تبني تطبيق الكوبون. ومفيش endpoint لـ Products You May Like في Swagger، المينتور قال إنه موجود فاتأكد قبل البناء.

## Meta

- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Cart Page
- Type: Story
- Priority: Medium

## User Story

As a **shopper**, I want to **see my order summary, apply a coupon, and discover more products from my cart**, so that **I know what I will pay and can keep shopping**.

## Tasks / Features

### Summary

On the right side of the Cart page:

- A Coupon Code input and an Apply Coupon button.
- A place for the applied coupons. It shows "No coupons applied" when there are none. An applied coupon is added to this list.
- Subtotal and Total. They follow the cart.

### Checkout

The Checkout button opens the Checkout page. That page stays empty. Building checkout is a later task, not this one.

### Products You May Like

A carousel under the cart. The products depend on the user. Use the same reusable carousel as Related Products.

## API

### Coupons

Swagger only has `GET /api/coupons` and `GET /api/coupons/<id>`. Fields: the coupon code, `type`, `value`, `minPurchase`, `maxDiscount`, `usageLimit`, `usedCount`, `validFrom`, `validUntil`, `isActive`. There is no apply endpoint, and the cart response has no coupon.

### Products You May Like

Swagger lists no endpoint for it. The mentor said one exists, so confirm it before building.

## Dependencies

- This task shares the Cart page with the Cart List task, especially the top of the page. Coordinate with that owner.
- The carousel is shared with the Product Overview task (Related Products). Coordinate with that owner.

## Open questions

Ask the mentor. Do not guess.

- How a coupon is checked and applied. Do not invent an apply request. Ask before building that part.

## Design

Figma "Rose App (Enhanced)": the Cart page, right side (Summary) and Products You May Like. Anything not specified here follows Figma, including light and dark mode, English and Arabic (LTR/RTL), and the invalid-coupon and loading states.
