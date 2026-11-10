# Rose App — Sprint 3 plan (السبرنت الثالث)

> **ملخّص بالعربي:** السبرنت الثالث (Sprint 3) في مشروع Rose App في ايليفيت (Elevate Tech) فيه 6 تاسكات: صفحة الـ Wishlist وزر المفضلة، صفحة المنتجات مع الـ Pagination وAdd to Cart، صفحة تفاصيل المنتج والـ Related Products، الـ Reviews، صفحة الـ Cart (القائمة)، وملخص السلة مع الكوبون وProducts You May Like. برانش السبرنت هو `sprint/3-wishlist-products-cart`. كل تاسك ليها برانش وPR title تحت، والبرانش يتفرّع من برانش السبرنت مش من master. توزيع التاسكات ممكن يختلف من جروب للتاني.

Sprint 3 of the Rose App website (Elevate Tech bootcamp). This is the current plan: a cohort may move a task to a later sprint or add a new one. The task content itself lives in each task document.

Sprint branch: `sprint/3-wishlist-products-cart`. Each task branch is created from that branch. The PR targets it, and the PR title is the one in the table.

## Tasks in Sprint 3 (6 tasks)

1. **Wishlist: Wishlist Page & Add to Favorite Functionality** (epic: Wishlist) — زر القلب على كارت المنتج (إضافة وإزالة، مع تغيير اللون)، أيقونة القلب في الـ Header تفتح صفحة الـ Wishlist، عدّاد حي، Clear wishlist، وحذف كل عنصر. المنتج الـ out of stock من غير Add to cart وزر Explore Similar Products. الـ API محتاج مستخدم داخل.
   - Branch: `feat/wishlist-page-add-to-favorite`
   - PR title: `feat(wishlist): add wishlist page and add to favorite functionality`
2. **Products Page: Product List & Add to Cart Functionality** (epic: Products Page) — جريد المنتجات بنفس صفوف وأعمدة Figma، Pagination، وAdd to Cart للضيف (local storage من غير token) وللمستخدم الداخل (`POST /api/cart`). الجريد بيقرا فلاتر الـ URL.
   - Branch: `feat/products-list-add-to-cart`
   - PR title: `feat(products): add product list, pagination and add to cart functionality`
3. **Product Details: Product Overview & Related Products** (epic: Product Details) — معرض الصور، السعر والستوك والوصف (الوصف الطويل يسكرول وزر Add to cart ثابت)، زيادة الكمية لحد حد أقصى، وكاروسيل Related Products قابل لإعادة الاستخدام.
   - Branch: `feat/product-overview-related-products`
   - PR title: `feat(product): add product overview and related products`
4. **Product Details: Product Reviews** (epic: Product Details) — متوسط التقييم وعدد المقيّمين، قائمة ريفيوهات بتسكرول جوه مساحتها، وفورم تقييم بنص نجمة. الضيف يشوف الفورم مموّه ورسالة تسجيل دخول.
   - Branch: `feat/product-reviews`
   - PR title: `feat(product): add product reviews`
5. **Cart Page: Cart List** (epic: Cart Page) — عنوان Cart مع العدد، Clear Cart، تعديل الكمية بحد أقصى 6، حذف عنصر، Continue Shopping. الضيف من local storage، وبعد تسجيل الدخول العناصر تتنقل للـ API.
   - Branch: `feat/cart-list`
   - PR title: `feat(cart): add cart list`
6. **Cart Page: Summary & Products You May Like** (epic: Cart Page) — كوبون، Subtotal وTotal، زر Checkout يفتح صفحة فاضية، وكاروسيل Products You May Like بنفس كومبوننت Related Products.
   - Branch: `feat/cart-summary-products-you-may-like`
   - PR title: `feat(cart): add summary and products you may like`

## Epics

- **Wishlist:** the favorite button on product cards, the header heart, and the Wishlist page.
- **Products Page:** the filtered, paginated product grid and the add-to-cart behavior other tasks reuse.
- **Product Details:** the product page (gallery, info, related products) and the reviews block.
- **Cart Page:** the cart list and the summary (coupon, totals, suggestions). Checkout itself is empty and is a later task.
