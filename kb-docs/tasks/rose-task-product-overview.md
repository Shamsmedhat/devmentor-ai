# Rose App task — Product Details: Product Overview & Related Products

> **ملخّص بالعربي:** تاسك صفحة المنتج: معرض كل الصور مع ستايل الصورة المختارة والهوفر، والعنوان والسعر (والسعر القديم مشطوب لو موجود) ونص الستوك والتقييم والوصف. الوصف الطويل يسكرول جوه مساحته وزر Add to cart يفضل ثابت. الزر يغيّر لونه والمنتج في السلة، وكل ضغطة تانية تزود الكمية لحد حد أقصى (السلة بتستخدم 6، اسأل المينتور لو الحد من الستوك). الفيدباك يا toast يا رقم على أيقونة السلة، ويستخدم في كل مكان فيه Add to cart. Related Products كاروسيل باسهم تحت الصفحة، كومبوننت يعاد استخدامه في Products You May Like. الـ API: `GET /api/products/<id>`. مفيش endpoint للـ related products في Swagger، اتأكد من المينتور، ولحدها استخدم `GET /api/products` بنفس الـ categoryId.

## Meta

- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Product Details
- Type: Story
- Priority: Medium

## User Story

As a **shopper**, I want to **see a product's images, details and related products, and add it to my cart from its page**, so that **I can decide what to buy**.

## Tasks / Features

### Gallery

Shows every product image, with the selected and hovered styles from Figma.

### Product info

Title, price (the old price is struck through when there is one), stock text (for example "265 left in stock", or out of stock), rating, and description.

### Long description

The description must not grow taller than the gallery. The description area scrolls and Add to cart stays in place. A description of about 150 words is the check: the gallery height and the button do not move.

### Add to cart button

Reuse the add-to-cart behavior from the Product List task.

- While the product is in the cart, the button changes color (for example black, like the wishlist state). Changing the icon is also fine.
- Pressing it again increases the quantity (2, then 3, then 4) up to a maximum.

### Visual feedback

A second press only changes a number, so the user has to see it. Either approach is accepted, and the same choice is used everywhere Add to cart appears:

1. A toast. The first one says "Product added successfully to cart". The next one is a different message, such as "Quantity increased".
2. The quantity number shown over the cart icon.

The team may use one of these or both.

### Related Products

A carousel with arrows at the bottom of the page, per Figma. Build it as a reusable component. The cart's "Products You May Like" uses the same one.

## API

- Product: `GET /api/products/<id>`.
- Swagger lists no related-products endpoint. The mentor said one exists, so confirm it before building. Until then, fall back to `GET /api/products` with the same `categoryId`.

## Dependencies

- Add to cart comes from the Product List task.
- The Related Products carousel is shared with the Cart Summary task. The two owners agree on the component.

## Open questions

Ask the mentor. Do not guess.

- The cart uses 6 as the quantity maximum. Confirm whether this page uses 6 or the product's stock.

## Design

Figma "Rose App (Enhanced)": the Product page, Product Details and Related Products, including the note about the description. Anything not specified here follows Figma, including light and dark mode and English and Arabic (LTR/RTL).
