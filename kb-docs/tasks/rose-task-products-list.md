# Rose App task — Products Page: Product List & Add to Cart Functionality

> **ملخّص بالعربي:** تاسك صفحة المنتجات: جريد بنفس صفوف وأعمدة Figma، وبيقرا فلاتر الـ URL ويبعتها لـ `GET /api/products`. الـ Pagination من الـ design system لازم يشتغل مع الجريد، ولو مكسور إصلاحه جزء من التاسك. التاسك دي مالكة وظيفة Add to Cart: الضيف من غير token يحفظ في local storage، والمستخدم الداخل يعمل `POST /api/cart`. كمية الزر والفيدباك البصري زي تاسك Product Overview. زر القلب جاي من تاسك الـ Wishlist.

## Meta

- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Products Page
- Type: Story
- Priority: Medium

## User Story

As a **shopper**, I want to **browse products in a paginated grid and add them to my cart**, so that **I can start buying**.

## Tasks / Features

### Product grid

Same rows and columns as Figma. Read the filter params that the Filters task writes to the URL and send them to `GET /api/products`.

### Pagination

Pagination must change the products shown. Use the Pagination component from the design system. If that component is missing or broken, fixing it is part of this task, and the student tells the mentor.

### Add to cart

This task owns the add-to-cart behavior. The cart button on the product card adds the product. It works for a guest and for a logged-in user. A guest needs no token and no login.

- Logged in: `POST /api/cart` with body `productId` and `quantity`.
- Guest: save the item in local storage. The Cart List task reads that same storage.
- The quantity and the visual feedback after a click are defined in the Product Overview task. Use that same behavior here.

### Add to favorite

The heart on the card comes from the Wishlist task. This task does not rebuild it.

### Out of stock

Out-of-stock cards follow Figma.

## API

`GET /api/products` accepts `page`, `limit`, `categoryId`, `subCategoryId`, `occasionId`, `minPrice`, `maxPrice`, `minRating`, `sortBy`, and `sortOrder`.

## Dependencies

- The Filters task writes the URL params. Use the same param names.
- The heart button comes from the Wishlist task.

## Open questions

Ask the mentor. Do not guess.

- The Home page cards were static. It is not decided whether this task should wire them to this add-to-cart logic.

## Design

Figma "Rose App (Enhanced)": the Products page and the product card. Anything not specified here follows Figma, including light and dark mode and English and Arabic (LTR/RTL).
