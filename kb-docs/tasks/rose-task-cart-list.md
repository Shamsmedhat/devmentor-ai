# Rose App task — Cart Page: Cart List

> **ملخّص بالعربي:** تاسك قائمة السلة: عنوان Cart وجنبه عدد المنتجات، وزر Clear Cart يفضي السلة. كل عنصر فيه تفاصيل وزر Remove، وخانة كمية يكتبها المستخدم مع أزرار + و−. السعر يتبع الكمية: قطعة `(x1)` وسعرها، وقطعتين `(x2)` وسعر الاتنين. الحد الأقصى للكمية 6 زي التصميم، واسأل المينتور لو المفروض ييجي من ستوك المنتج. Continue Shopping يفتح صفحة المنتجات. المستخدم الداخل يحمّل السلة من الـ API بالتوكن، والضيف من local storage، ولما الضيف يسجّل دخوله العناصر تتنقل لـ API السلة.

## Meta

- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Cart Page
- Type: Story
- Priority: Medium

## User Story

As a **shopper**, I want to **review my cart and change what is in it**, so that **I can check my order before buying**.

## Tasks / Features

### Header

The title "Cart" with the number of products beside it, and a Clear Cart button that empties the cart.

### Each item

- Product details and a Remove button.
- A quantity input the user can type in, plus and minus buttons.
- The price follows the quantity. One piece shows `(x1)` and its price. Two pieces show `(x2)` and the price for both.
- The quantity never goes above the maximum. The design uses 6, so use 6.

### Continue Shopping

Opens the Products page.

### Guest and logged-in user

The page works for both.

- Logged in: load the cart from the API with the user's token.
- Guest: keep the cart in local storage.
- When the guest logs in: move the items from local storage to the cart API.

## API

These need a logged-in user.

- `GET /api/cart`
- `POST /api/cart` with `productId` and `quantity`
- `PATCH /api/cart/<id>` with `quantity`
- `DELETE /api/cart/<id>` removes one item
- `DELETE /api/cart` clears the cart

## Dependencies

- The top of the Cart page is shared with the Cart Summary task. Arrange it with that task's owner.
- The Product List task writes add-to-cart into the same local storage.
- Needs the logged-in session from the Authentication work.

## Open questions

Ask the mentor. Do not guess.

- The design maximum is 6. Ask whether the limit should come from the product stock instead.

## Design

Figma "Rose App (Enhanced)": the Cart page, left side. Anything not specified here follows Figma, including light and dark mode, English and Arabic (LTR/RTL), and the empty cart and loading states.
