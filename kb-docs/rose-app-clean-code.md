# Rose App — Clean code reference (الكود النضيف)

> **ملخّص بالعربي:** مرجع الكود النضيف (clean code) لطلبة مشروع Rose App في ايليفيت. الأولوية: الكود يشتغل، يبقى مقروء، وبعدين مترتب. الاسم يقول إيه وليه من غير كومنت. الـ boolean يبدأ بـ is أو has أو should. الفانكشن صغيرة وتعمل حاجة واحدة، ومن غير flag boolean. متكررش نفسك (DRY): الـ JSX المتكرر يبقى component، واللوجيك يبقى function، والـ state مع الـ useEffect يبقى custom hook. الكومنت للسبب (why) أو WARNING أو TODO، ومفيش كود متعمله comment ومفيش console.log. ترتيب جوه الـ component: Translation، Navigation، State، Ref، Context، Query، Mutation، Custom hooks، Form، Variables، Functions، Effects. لو القيمة تتحسب، متحطهاش في state ومتستخدمش useEffect عشان تعمل sync. مفيش `any`. الستايل Tailwind بـ semantic tokens مش ألوان hex. أي نص ظاهر للمستخدم في ملفات الـ i18n. قبل الـ push راجع الأسماء والتكرار والـ any والـ useEffect.

Quick reference for Elevate Tech juniors on the Rose App (Next.js 16). If a general rule and a stack rule below disagree, follow the stack rule.

If you only remember three things:

1. Write names the next person can read.
2. Keep functions small.
3. Don't repeat yourself.

When rules clash, in this order: make it work, then make it readable, then make it well-structured.

## Names

A good name tells you what and why without a comment.

```ts
// Bad
const [data, setData] = useState(null);
const [flag, setFlag] = useState(false);

// Good
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(false);
```

- Functions are verbs: `getProducts`, `submitOrder`, `isLoading`.
- Booleans start with `is`, `has`, or `should`.
- No magic numbers. Name them: `if (day > WORK_DAYS_PER_WEEK)`, not `if (day > 5)`.
- Pick one word per concept. Don't mix `get`, `fetch`, and `retrieve` for the same thing.
- No types inside names (`strName`, `IProduct`). The IDE shows the type.

## Functions

Small. One job. Few arguments. Aim for about 20 lines or less. If a function does several things, those are separate functions it calls.

```ts
// Bad — does everything
async function submitOrder(form) {
  // validate, format, call API, toast, redirect, log
}

// Good — each step has a name
async function submitOrder(form: OrderForm) {
  const data = validateOrder(form);
  const payload = formatOrder(data);
  await createOrder(payload);
  notifyOrderPlaced();
  redirectToConfirmation();
}
```

- No boolean flag arguments. A flag means the function does two things. `renderActiveItem(item)` and `renderInactiveItem(item)`, not `renderItem(item, true)`.
- Prefer one object argument over many positional ones.
- A function either answers a question or does an action. Never both.
- No hidden side effects. `addProduct` only adds a product.

## DRY

Copy-paste is the main source of bugs. Make it work first, then refactor.

- Repeated JSX becomes a reusable component.
- Repeated logic becomes a utility function.
- Repeated `useEffect` or state logic becomes a custom hook.

## Comments

Default is no comment. A good name is better.

Avoid comments that restate the code, commented-out code (git has the history), diary notes like "fixed a bug here", and JSDoc on every function.

A comment is fine as a section header over a group of lines (`// State`, `// Effects`), as `// WARNING:` or `// TODO:` with real context, or to explain a non-obvious why.

## Component structure

Inside a component, declare things in this order. Put a section comment above each group you use.

Translation, Navigation, State, Ref, Context, Query, Mutation, Custom hooks, Form, Variables, Functions, Effects.

```tsx
function ProductCard({ id }: { id: string }) {
  // Translation
  const t = useTranslations("ProductCard");

  // Navigation
  const router = useRouter();

  // State
  const [isOpen, setIsOpen] = useState(false);

  // Ref
  const cardRef = useRef<HTMLDivElement>(null);

  // Context
  const { currency } = useContext(StoreContext);

  // Query
  const { data: product } = useSuspenseQuery(productQuery(id));

  // Mutation
  const { mutate: addToCart } = useMutation({ mutationFn: addToCartAction });

  // Custom hooks
  const { isFavorite, toggleFavorite } = useFavorite(id);

  // Form
  const form = useForm({ resolver: zodResolver(reviewSchema) });

  // Variables (derived)
  const formattedPrice = formatPrice(product.price, currency);

  // Functions (handlers)
  const handleAddToCart = () => addToCart(id);

  // Effects (rare, last)
  useEffect(() => {
    /* ... */
  }, []);

  return null;
}
```

## React rules of thumb

Derive, don't duplicate. If you can compute it, don't store it.

```ts
// Bad
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0);

// Good
const [items, setItems] = useState([]);
const itemCount = items.length;
```

- Don't copy props into state. Use the prop, or derive from it.
- `useEffect` should be rare. If it only syncs derived state, compute that value during render.
- Several state values that change together belong in `useReducer`.
- `useMemo`, `useCallback`, and `memo` only when they are needed, not by reflex.
- Values that don't depend on props or state are declared outside the component.
- Use `<>...</>` instead of a wrapper `div` when no element is needed.
- Don't reach for context when local state works.

## Errors and types

- Use `async`/`await`, not `.then()` chains.
- Handle errors in one shared place, not a `try/catch` in every component.
- Show the user a message they understand. Never a raw error.
- Use optional chaining (`a?.b?.c`) for values that might be missing.
- Never use `any`. Type from the API response, or use `unknown` and narrow it.

## CSS and HTML

Use one styling approach for the whole project. Rose App already chose Tailwind, so don't add CSS modules.

- Flexbox when the content shapes the layout (a navbar, a row of items).
- Grid when the layout shapes the content (a page template, a card grid).
- Avoid `!important`. Fix the specificity instead.
- Use semantic HTML: `button`, `nav`, `section`. Not a `div` for everything.
- Prefer `min()`, `max()`, `clamp()`, and `auto-fit` over piles of media queries.

## Project stack rules

Next.js App Router, v16:

- The middleware file is `proxy.ts`, not `middleware.ts`.
- Server Components by default. Push `"use client"` down to the smallest interactive leaf. Never put it on a whole page.

TypeScript: strict mode. No `any`.

Tailwind v4:

- Use semantic tokens: `bg-primary`, `text-destructive`, `border-ring`. Never a raw hex color.
- Reusable components are `w-full` and sized by the parent. No baked-in widths like `w-82`.

shadcn/ui: use it for primitives.

next-intl:

- Locales are `/en` and `/ar`. Message keys are flat.
- Never hardcode a user-facing string.
- For RTL, use logical properties: `ps-`, `pe-`, `ms-`, `me-`, `inset-s-0`. Not `left` or `right`.

Forms: React Hook Form and Zod. One schema, a shared resolver, and no manual validation state.

Server state: React Query. Gate devtools behind `process.env.NODE_ENV === "development"`.

Structure:

- Feature-based folders under `src/shared/`.
- Kebab-case route folders.
- One alias: `@/` points at `src/`.

Accessibility:

- A `label` linked to each input.
- `aria-label` on icon-only buttons.
- Visible `focus-visible` states.
- `aria-invalid` and `aria-describedby` on fields with an error.

## Self-check before you push

- Can someone read the names and know what they do?
- Is each function doing one thing?
- Is any copy-paste actually a component, a hook, or a util?
- Is there an `any`?
- Is there a hardcoded string that belongs in the i18n messages?
- Is there a raw color instead of a semantic token?
- Is there a `useEffect` that should be a derived value?
- Is there commented-out code or a `console.log`?

Code is read much more often than it is written. Write it for the next person.
