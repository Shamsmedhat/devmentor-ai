# Rose App task — Wishlist: Wishlist Page & Add to Favorite Functionality

> **ملخّص بالعربي:** تاسك الـ Wishlist: زر المفضلة (القلب) على كارت المنتج من الألف للياء، وباقي التاسكات تعيد استخدامه. الهوفر يقول Add to wishlist، والضغط يضيف المنتج ويغيّر لون الزر، والضغط تاني يشيله (Remove from wishlist). أيقونة القلب في الـ Header تفتح صفحة الـ Wishlist. الصفحة فيها عنوان وأيقونة وعدّاد حي، Clear wishlist، وحذف لكل عنصر. المنتج الـ in stock يظهر عليه Add to cart، والـ out of stock يتخفى منه Add to cart ويظهر Explore Similar Products ويفتح صفحة المنتجات متفلترة بكاتيجوري المنتج. Continue shopping يفتح صفحة المنتجات من غير فلاتر. الستوك يتقرأ من الـ API في كل تحميل، وممنوع إضافة منتج out of stock للسلة. الـ API كله محتاج مستخدم مسجّل دخوله.

## Meta

- Project: Rose App website (Elevate Tech bootcamp)
- Epic: Wishlist
- Type: Story
- Priority: Medium

Explore Similar Products is the out-of-stock wishlist action. It opens the Products page filtered by that product's category. Add to cart is hidden on that card.

## User Story

As a **shopper**, I want to **save products to a wishlist and manage them from a Wishlist page**, so that **I can come back to them later**.

## Tasks / Features

### Add to favorite button

This task owns the heart button on the product card. Other tasks reuse it.

- Hover shows "Add to wishlist".
- Click adds the product and changes the button color.
- Click again removes it and the label is "Remove from wishlist".

### Header

The heart icon in the header opens the Wishlist page.

### Wishlist page

- Title and icon with a live count of the items.
- Product cards use the same design, rating, and details as the rest of the app.
- Clear wishlist removes every item. Each item also has its own delete.
- In stock: the card shows Add to cart. The add-to-cart behavior comes from the Product List task.
- Out of stock: hide Add to cart and show Explore Similar Products. It opens the Products page filtered by that product's category.
- Continue shopping opens the Products page with no filters.

### Stock

The wishlist keeps both in-stock and out-of-stock products. A saved product can go out of stock later, so read the stock from the API on every load. Never let the user add an out-of-stock product to the cart.

## API

All of these need a logged-in user.

- `GET /api/wishlist`
- `POST /api/wishlist` with body `productId`
- `DELETE /api/wishlist` clears the list
- `DELETE /api/wishlist/<id>` removes one item

## Dependencies

- Add to cart on the cards comes from the Product List task.
- Needs the logged-in session from the Authentication work.

## Open questions

Ask the mentor. Do not guess.

- The API needs a logged-in user. It is not defined what a guest sees when they click the heart.

## Design

Figma "Rose App (Enhanced)": the Wishlist page and the Add to wishlist / Remove from wishlist button. Anything not specified here follows Figma, including light and dark mode, English and Arabic (LTR/RTL), and the empty and loading states.
