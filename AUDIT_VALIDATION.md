# دُكّـانـي (Dukkani) — Audit Validation & Deep UX Review

**Date of Validation:** September 29, 2026  
**Document Type:** Second-Pass Deep UX & Technical Validation  
**Target Application:** Dukkani Single-Store E-Commerce (`https://github.com/EbrahimQaid/Bastah.git`)  
**Scope:** Verification of Previous Audit Claims, Complete Interactive Element Audit, Search Experience Deep-Dive, Flow Continuity Analysis, State Coverage, Trust Boundary Review, and Architectural Scalability  
**Methodology:** Direct Source Code Inspection & Runtime Flow Tracing (Zero Source Code Modified)  

---

## 1. Executive Summary

This second-pass validation challenges, verifies, and deepens the findings of the initial `AUDIT_REPORT.md`. Rather than merely categorizing files, this review traces every interactive element, data boundary, client-server contract, and page transition across both customer and merchant surfaces.

### 1.1 Core Conclusions from the Validation
1. **Critical Data Integrity Gap (Discounts & Currency)**: The previous audit noted that coupon codes were client-side. This second pass reveals a far more serious flaw: **discounts applied in the cart are not passed to checkout or processed by the server** (`Checkout.tsx` sends only items and form fields, and `storeController.createOrder` computes totals exclusively from base product prices in the database). Furthermore, the `orders` database table lacks a currency column in its active insertion model, meaning orders placed while viewing USD or YER are recorded as raw values under the store's base currency without conversion provenance.
2. **Interactive Defect on Quick Add**: Confirmed that `Home.tsx` (line 41) and `ProductList.tsx` (line 41) execute `window.location.href = ...` whenever an item has variants, destroying React state, clearing in-memory TanStack Query caches, and causing full browser reloads.
3. **Overstated Claims in Initial Audit**: Claims that the UI was "100% WCAG AA compliant" and that "all interactive elements adhere to 44×44px touch targets" were **incorrect**. Inspection revealed buttons as small as 22×22px (announcement close) and 24×24px (preference popover close), as well as text contrast ratios below 3:1 on product card metadata.
4. **Search Experience Flaw**: Clicking the header search icon navigates to `/store/products`, but does not focus the input, does not synchronize search text with the URL query string (`?q=`), and causes complete loss of search results if the shopper visits a product and clicks the browser's Back button.
5. **Mobile Layering Collision**: On mobile viewports, the sticky purchase bar on `ProductDetail.tsx` (`fixed bottom-0 z-50`) renders on top of the unhidden mobile bottom navigation bar (`z-40`), because `hideBottomNav` is never passed to `StoreLayout`.

---

## 2. Previous Audit Validation Matrix

Every major claim from `AUDIT_REPORT.md` was audited against the live source code and classified as **VERIFIED**, **PARTIALLY VERIFIED**, **NOT VERIFIED**, **INCORRECT**, or **NEEDS PRODUCT DECISION**.

| Claim / Issue from Previous Audit | Previous Severity | Validation Status | Concrete Code & File Evidence | Revised Severity |
| :--- | :--- | :--- | :--- | :--- |
| **`window.location.href` on Quick Add** | P0 | **VERIFIED** | `Home.tsx:41`, `ProductList.tsx:41`. Bypasses Wouter router and causes full browser unmount and re-render. | **P0** (Broken Core SPA UX) |
| **Flutter App Directory (`store_app/`)** | P0 | **PARTIALLY VERIFIED** | `store_app/` exists at root. While it bloats the repository, it does not break web runtime execution or build outputs. | **P2** (Repository Hygiene) |
| **ProductCard Code Duplication** | P1 | **VERIFIED** | `Home.tsx:23-155` and `ProductList.tsx:23-155` are 100% duplicate code (~130 lines identical props, hooks, JSX). | **P1** (Architecture Debt) |
| **Misleading Route `/store/profile`** | P1 | **VERIFIED** | `StoreLayout.tsx:294,640`, `Profile.tsx:1-311`. Nav label is "عن المتجر" / "About", content is policies & store info, not a user profile. | **P1** (Information Architecture) |
| **Client-Side Hardcoded Coupon Codes** | P1 | **VERIFIED & WORSE THAN REPORTED** | `Cart.tsx:47-66` validates codes in local state; `Checkout.tsx:61` does not transmit discount; `storeController.js:145-150` calculates total without discount. | **P0** (Data Integrity & Financial Logic) |
| **WCAG AA Compliance Claim** | Positive Claim | **INCORRECT** | `ProductCard` price label has `text-[10px] text-neutral-400` on white background (~2.8:1 contrast, fails 4.5:1 AA standard). Color swatches lack `aria-label`. | **P2** (Accessibility Defect) |
| **44×44px Touch Targets Claim** | Positive Claim | **INCORRECT** | `StoreLayout.tsx:234` announcement close button is ~22×22px; `StoreLayout.tsx:345` popover close is 24×24px; `Cart.tsx:165` steppers are 32×32px. | **P2** (Mobile Usability Defect) |
| **Production Build Size < 200 KB** | Positive Claim | **INCORRECT** | Measured build via `npm run build`: main bundle is **801.80 kB** (225.78 kB gzip) and CSS is **126.28 kB**. | **P2** (Bundle Optimization) |
| **Dual LocalStorage Tokens** | P2 | **VERIFIED** | `Register.tsx:64-67`, `DashboardLayout.tsx:35-38`, `api.ts:90`. Both `dukkani_token` and `bastah_token` are set and read. | **P2** (State Hygiene) |
| **Privacy on `/store/order-success`** | Positive Claim | **VERIFIED** | `OrderSuccess.tsx:16-19` reads session storage. Direct URL access without session falls back to redaction notice. | Verified as working |
| **Database Fallback in Local Mode** | Positive Claim | **VERIFIED** | `server/lib/db.js:1-120` checks `process.env.DATABASE_URL` and boots in-memory mock database when absent. | Verified as working |
| **Multi-Currency Calculation** | Positive Claim | **PARTIALLY VERIFIED** | Display conversion in `currency-context.tsx` works, but backend orders store amounts in default currency without currency code tracking. | **P1** (Currency Provenance Gap) |

---

## 3. Complete Interaction Audit

Every interactive element across the application was traced from click to completion.

| Interface Area | Interactive Element | Current Result | Is Destination / Result Appropriate? | Context Lost? | Recommended Pattern | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Header** | Brand Logo / Wordmark | Navigates to `/store` | Yes, standard e-commerce behavior. | No | Keep as is (`Link href="/store"`). | P3 |
| **Header** | Nav Links (الرئيسية, المنتجات, السلة) | Client-side navigation via Wouter | Yes, fast and preserves layout. | No | Keep as is. | P3 |
| **Header** | Nav Link "عن المتجر" | Navigates to `/store/profile` | No, URL path `/store/profile` creates false expectation of user account. | Minor | Update route to `/store/about` with redirect from `/store/profile`. | P1 |
| **Header** | Search Icon Button | Navigates to `/store/products` | Appropriate for small catalog, but input is not focused. | Partial | Navigate to `/store/products?focusSearch=true` and auto-focus search input. | P2 |
| **Header** | Preferences Trigger (`Globe`) | Toggles floating popover in-place | Yes, avoids page navigation for language/currency. | No | Keep in-place popover; ensure click-outside works reliably. | P3 |
| **Header** | Bag / Cart Trigger | Slides open `MiniCart` drawer | Yes, excellent 2-tier cart interaction. | No | Keep drawer pattern. | P3 |
| **MiniCart** | Quantity Steppers (`+` / `-`) | Updates quantity in `useCart` in-place | Yes, immediate feedback with zero reload. | No | Keep in-place; expand touch target to min 44px. | P2 |
| **MiniCart** | "عرض السلة الكاملة" Button | Navigates to `/store/cart` | Yes, deliberate shopping flow. | No | Keep as is. | P3 |
| **MiniCart** | "إتمام الطلب" Button | Navigates to `/store/checkout` | Yes, fast checkout flow. | No | Keep as is. | P3 |
| **Home Hero** | "استعراض الكتالوج" Button | Navigates to `/store/products` | Yes, primary CTA. | No | Keep as is. | P3 |
| **Home Hero** | "معلومات المتجر" Button | Navigates to `/store/profile` | Appropriate content, misleading URL. | Minor | Point to `/store/about`. | P1 |
| **Home Grid** | Category Filter Pills | Filters 8 products on homepage in-place | Yes, lightweight discovery. | No | Keep in-place. | P3 |
| **Home Grid** | "استعراض كافة المنتجات" | Navigates to `/store/products` | Drops selected category from homepage! | **YES** | Pass category: `/store/products?categoryId=${selectedCategory}`. | **P1** |
| **Product Card** | Card Click / Tap | Navigates to `/store/products/:id` | Yes, dedicated inspection page. | No | Keep as is. | P3 |
| **Product Card** | Quick Add (No Variants) | Adds to cart in-place, opens drawer | Yes, frictionless purchase. | No | Keep as is. | P3 |
| **Product Card** | Quick Add (With Variants) | Triggers `window.location.href = ...` | **NO!** Causes full browser reload. | **YES** | Replace with Wouter `setLocation(\`/store/products/\${id}\`)`. | **P0** |
| **Catalog** | Search Input | Filters products via debounced query | Good in-place filtering, but query is not in URL. | **YES** (on Back) | Sync query to URL (`?q=...`) so Back button restores results. | **P1** |
| **Catalog** | Category Sidebar / Pills | Filters catalog in-place | Yes, immediate feedback. | No | Keep in-place. | P3 |
| **Catalog** | Reset Filters Button | Resets price/category/search in-place | Yes, clear and immediate. | No | Keep in-place. | P3 |
| **Product Detail** | Thumbnail Gallery Clicks | Updates hero image in-place | Yes, standard gallery UX. | No | Keep in-place. | P3 |
| **Product Detail** | Size / Color Swatches | Toggles variant selection in-place | Yes, inline validation cues work. | No | Keep in-place; add `aria-label` to swatches. | P2 |
| **Product Detail** | Quantity Steppers | Increments/decrements local state | Yes. | No | Keep in-place. | P3 |
| **Product Detail** | Desktop "إضافة إلى السلة" | Adds item to cart, opens drawer | Yes. | No | Keep in-place. | P3 |
| **Product Detail** | Mobile Sticky Bottom Bar | Duplicates Add to Cart button | Collides with mobile bottom navigation bar! | **YES** | Pass `hideBottomNav={true}` to `StoreLayout` on `ProductDetail`. | **P1** |
| **Cart** | Coupon "تطبيق" Button | Checks string in local state | Shows discount, but discount is lost on checkout! | **YES** | Pass discount/coupon to `useCart` state and checkout mutation. | **P0** |
| **Cart** | "المتابعة لإتمام الطلب" | Navigates to `/store/checkout` | Yes. | No | Keep as is. | P3 |
| **Checkout** | Form Submit ("تأكيد الطلب") | Posts order, navigates to success page | Yes, clean transition to `/store/order-success/:id`. | No | Keep as is. | P3 |
| **Order Success**| "متابعة الطلب عبر واتساب" | Opens WhatsApp with pre-filled text | Yes, essential for regional COD confirmation. | No | Keep external target. | P3 |
| **Order Success**| "مواصلة التسوق" | Navigates to `/store` | Yes. | No | Keep as is. | P3 |
| **Dashboard** | Sidebar Links | Client-side navigation between views | Yes, fast SPA transition. | No | Keep as is. | P3 |
| **Dashboard** | "معاينة متجر العملاء" | Opens `/store` in new tab | Yes, preserves merchant session. | No | Keep `target="_blank"`. | P3 |
| **Dashboard** | Logout Button | Clears tokens, redirects to `/login` | Yes, clean unmount. | No | Keep as is. | P3 |
| **Orders Table** | Status Filter Tabs | Filters table in-place | Yes, responsive and instant. | No | Keep in-place. | P3 |
| **Orders Table** | Order Row Click | Navigates to `/dashboard/orders/:id` | Yes, full order review. | No | Keep as is. | P3 |
| **Order Detail**| Status Dropdown | Updates order status via API in-place | Yes, updates cache with toast feedback. | No | Keep in-place. | P3 |
| **Order Detail**| WhatsApp / Call Buttons | Opens WhatsApp / initiates phone call | Yes, direct customer communication. | No | Keep external protocols (`wa.me`, `tel:`). | P3 |
| **Settings** | Tab Switcher | Switches tabs in-place | Yes, keeps form state intact. | No | Keep in-place. | P3 |
| **Settings** | Form Submit ("حفظ الإعدادات")| Updates store settings via API in-place | Yes, updates cache and displays toast. | No | Keep in-place. | P3 |

---

## 4. Search UX — Deep Evaluation

### 4.1 Evaluation of Evaluated Alternatives
We evaluated four search interaction models specifically for Dukkani's catalog scale (~10 to 500 items):
1. **Model A: Header Search -> Dedicated Catalog Page (`/store/products`) [CURRENT]**:
   - *Pros*: Leverages existing robust filtering, category pills, price sliders, and sorting in one unified screen without code bloat.
   - *Cons in current state*: Input does not auto-focus, query is not preserved in URL, and pressing Back from a product resets search.
2. **Model B: Expandable Inline Header Search**:
   - *Analysis*: On desktop, expands an input inside the top header. However, on mobile viewports (360–390px), there is insufficient horizontal real estate alongside the logo, preferences trigger, and cart button.
3. **Model C: Search Overlay / Drawer**:
   - *Analysis*: Opens a full-screen search modal with live autocomplete. While popular on massive marketplaces (e.g. Amazon), for a boutique store with 20–100 products it adds unnecessary modal abstraction and doubles API querying.
4. **Model D: Hybrid URL-Synchronized Catalog Search [RECOMMENDED]**:
   - Keep the dedicated catalog page at `/store/products`, but fix the UX friction points:
     - Header search button links to `/store/products?focus=search`.
     - `ProductList.tsx` automatically focuses the input when `focus=search` is present.
     - Search input synchronizes bidirectional with URL query param `?q=...`.
     - Browser Back button from product detail naturally restores the search term and filtered results.

### 4.2 Search Feature Checklist
- **Autofocus**: Currently **Missing**.
- **Search Persistence**: Currently **Missing** (lost on page change or reload).
- **Query in URL**: Currently **Missing** (purely local React `useState`).
- **Clearing Search**: **Present** (small `X` button appears when text is entered).
- **Empty Search Results State**: **Present** (displays friendly "لا توجد منتجات مطابقة" with reset button).
- **Loading State**: **Present** (displays skeleton cards during TanStack Query fetch).
- **Keyboard Behavior**: `Esc` key does not clear search input.

---

## 5. Header & Navbar Consistency Audit

| Page Transition | Header State | Mobile Bottom Nav State | Consistency Assessment | Required Action |
| :--- | :--- | :--- | :--- | :--- |
| `/store` -> `/store/products` | Stable & Identical | Stable & Active on "Catalog" | **Consistent** | None |
| `/store/products` -> `/store/products/:id` | Stable & Identical | Bottom bar covered by sticky purchase bar | **Inconsistent / Layout Bug** | Pass `hideBottomNav={true}` to `StoreLayout` on `ProductDetail`. |
| `/store/products/:id` -> `/store/cart` | Stable & Identical | Stable & Active on "Bag" | **Consistent** | None |
| `/store/cart` -> `/store/checkout` | Stable & Identical | Bottom bar visible during checkout | **Undesirable Friction** | Pass `hideBottomNav={true}` on `Checkout` to maximize form space. |
| `/store/checkout` -> `/store/order-success/:id` | Stable & Identical | Bottom bar visible | **Acceptable** | Optional: hide bottom bar to focus on receipt. |
| `/store` -> `/store/profile` | Stable & Identical | Stable & Active on "Store" | **Consistent** | Rename route conceptually to `/store/about`. |
| Storefront -> `/dashboard` | Transitions to Merchant Sidebar | Replaced by Merchant Mobile Drawer | **Consistent** | Clear mental separation between shopper and admin. |

---

## 6. Complete User Flow Mapping

### 6.1 Shopper Flow Tracing
```
[Homepage: /store]
  │
  ├── 1. Clicks Category Pill ────► In-place filtered preview
  ├── 2. Clicks "All Products" ───► /store/products (Context lost: category not passed in query!)
  ├── 3. Taps Search in Header ───► /store/products (No autofocus, query not in URL)
  └── 4. Taps Product Card ───────► /store/products/:productId
                                       │
                                       ├── Selects Size/Color (Validation cues work)
                                       ├── Taps "Add to Bag"
                                       └── MiniCart Drawer slides open
                                            │
               ┌────────────────────────────┴──────────────────────────┐
               ▼                                                       ▼
      [Taps "Full Cart"]                                      [Taps "Checkout"]
      /store/cart                                             /store/checkout
         │                                                       │
         ├── Applies Coupon (Discount shown locally)             ├── Enters Name, Phone, Address
         ├── Clicks "Proceed to Checkout"                        ├── (Coupon discount NOT transmitted!)
         ▼                                                       ├── Clicks "Confirm Order"
      /store/checkout                                            ▼
         │                                                    /store/order-success/:orderId
         └── Submits Order ──────────────────────────────────►   │
                                                                 ├── View receipt (from session)
                                                                 └── One-click WhatsApp track
```
**Context Loss Discovered**:
1. **Category Filter**: Selecting a category on the homepage and clicking "استعراض كافة المنتجات" resets the category filter.
2. **Search State**: Searching for an item, opening its product page, and pressing the browser Back button resets the search input to empty.
3. **Discount State**: Applying a coupon in `Cart.tsx` does not persist into `Checkout.tsx`.

### 6.2 Merchant Flow Tracing
```
[Register / Login]
  │
  ├── Newly registered merchant ──► /dashboard/setup (Consolidated 1-step setup)
  │                                   │
  │                                   └── Submits store details ──► /dashboard
  │
  └── Returning merchant ─────────► /dashboard (Live KPIs: Sales, Orders, Inventory)
                                       │
       ┌───────────────┬───────────────┼───────────────┬───────────────┐
       ▼               ▼               ▼               ▼               ▼
  [Products]     [Categories]      [Orders]       [Settings]       [Preview Store]
  /dashboard/    /dashboard/      /dashboard/    /dashboard/       Opens /store in
  products       categories       orders         settings          new browser tab
       │                               │               │
       ├── Add / Edit Product          ├── Filter Tab  └── Tabs: Identity,
       │   (Variants, Images)          └── View Order      Shipping, Colors,
       └── Delete Product                  /orders/:id     Currencies
```
**Robustness of Merchant Flow**: Very high. Role-based routes are guarded by `ProtectedRoute`, session token expiration is handled with automatic redirection to `/login`, and store data is reliably synchronized via TanStack Query invalidation.

---

## 7. State Coverage Matrix

Audit of visual and functional states across primary pages:

| Page / Component | Initial | Loading | Empty | Error | Validation Error | Disabled | Dark Mode | Mobile (360px) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`StoreLayout`** | Yes | Yes (Pulse) | N/A | Yes (Shield Error) | N/A | N/A | Yes | Yes |
| **`Home.tsx`** | Yes | Skeleton | Handled | Handled | N/A | Handled | Yes | Yes |
| **`ProductList.tsx`** | Yes | Skeleton | Yes (PackageX) | Handled | N/A | Handled | Yes | Yes |
| **`ProductDetail.tsx`**| Yes | Skeleton | Yes (404 box) | Handled | Yes (Inline red alert)| Yes | Yes | Bar overlaps nav! |
| **`Cart.tsx`** | Yes | N/A | Yes (Bag box)| Handled | Coupon toast | Handled | Yes | Yes |
| **`Checkout.tsx`** | Yes | N/A | Yes (Redirect)| Toast | Yes (Required toast) | Pending spin | Yes | Yes |
| **`OrderSuccess.tsx`** | Yes | N/A | Redacted view | Handled | N/A | N/A | Yes | Yes |
| **`Profile.tsx`** | Yes | Skeleton | N/A | Handled | N/A | N/A | Yes | Yes |
| **`Dashboard/Overview`**| Yes | Spin pulse | 0 counts | Handled | N/A | N/A | Yes | Table scrolls |
| **`Dashboard/Products`**| Yes | Spin pulse | Yes (No rows)| Handled | Handled | Handled | Yes | Table scrolls |
| **`Dashboard/Orders`** | Yes | Spin pulse | Yes (No orders)| Handled| N/A | N/A | Yes | Tabs scroll |
| **`Dashboard/Settings`**| Yes | Spin pulse | N/A | Handled | Form checks | Pending spin | Yes | Tab scroll |

---

## 8. Information Architecture Review

| Term / Concept | Current Usage | User Expectation | Assessment | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `/store/profile` | Public page showing store story, return policies, regional preferences, and merchant phone. | A personal customer account with past order history, saved addresses, and profile details. | **Clearly Misleading** | Rename conceptually and route to `/store/about` ("عن المتجر والسياسات"). Preserve redirect for old links. |
| **"عن المتجر"** | Navigation label in top header. | About the brand and store policies. | **Clear** | Accurate label; matches page purpose. |
| **Cart vs MiniCart**| Quick slide-over drawer vs full itemized page. | Quick drawer for rapid purchase; full page for reviewing multiple items. | **Clear** | Standard, highly functional e-commerce pattern. |
| **`Bastah` vs `Dukkani`**| Package name is `bastah`; UI branding is `دكاني - Dukkani`. | Consistent brand name throughout codebase and UI. | **Potentially Misleading** | Keep user-facing brand strictly `دكاني`; clean up internal variable remnants during future maintenance. |
| **Dashboard Setup** | Single unified page at `/dashboard/setup`. | Fast store initialization. | **Clear** | Previous duplicate `/onboarding` was removed; flow is now unified. |

---

## 9. AI-Generated UI Pattern Review (Evidence-Based)

| Observed Pattern | Exact Code Location | Evidence & Why It Matters | Is It a Problem? | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **Fabricated Metrics in Profile** | `Profile.tsx:111-136` | Three cards: "100% جودة أصلية", "24/7 دعم واستجابة", "14 يوم استبدال". These resemble generic AI landing badges. | Mild | Replace with actual store commitments (e.g. delivery cities, return policy details) or clean text assurances. |
| **Dark Spotlight Banner with Stock Image** | `Home.tsx:415-453` | Massive dark block with generic marketing copy and hardcoded perfume image (`product_royal_oud`). | Cosmetic | Acceptable for visual pacing, but should allow merchant customization via `themeConfig` in the future. |
| **Hardcoded Color Gradients** | `StoreLayout.tsx:465`, `Home.tsx:229`, `ProductDetail.tsx:372` | `linear-gradient(135deg, ${primaryColor}, #DC2626)` is hardcoded in multiple files. | Mild Maintenance | Use a consistent CSS utility or token rather than repeating raw gradient strings. |
| **Dormant Radix UI Components** | `src/components/ui/` (25+ files) | Files like `menubar.tsx`, `input-otp.tsx`, `context-menu.tsx`, `carousel.tsx` have zero imports in `src/`. | Passive Clutter | Does not affect bundle size (tree-shaken by Vite), but creates repository noise. |

---

## 10. Security & Trust Boundary Review

| Evaluated Boundary | Implementation Analysis | Risk Level | Classification |
| :--- | :--- | :--- | :--- |
| **Product Price Tampering** | Backend recalculates item prices directly from database records (`storeController.js:124-148`). Client cannot submit fake prices. | **Secure** | Data Integrity |
| **Order Total Calculation** | Server computes `total = subtotal + shippingRate` from database prices and store shipping rate. Client-submitted totals are ignored. | **Secure** | Data Integrity |
| **Coupon / Discount Tampering** | Discounts in `Cart.tsx` are evaluated client-side and **not applied on the server**. Shopper is charged full price. | **Critical UX & Logic Defect** | Business Logic / Data Integrity |
| **Order Access via URL Enumeration** | `OrderSuccess.tsx` checks `sessionStorage.getItem("dukkani_receipt_" + orderId)`. Strangers hitting `/store/order-success/123` see a redaction notice. | **Secure** | Privacy / Authorization |
| **Merchant Authorization** | `requireAuth` middleware verifies JWT token, checks user active status, and resolves `storeId`. Protected routes reject unauthorized requests. | **Secure** | Authentication / Security |
| **Dual LocalStorage Tokens** | Tokens stored in both `dukkani_token` and `bastah_token`. | **Low Risk** | State Hygiene |
| **Currency Provenance in Orders** | Orders table does not record the currency code of the transaction; backend assumes store base currency. | **Medium Risk** | Financial Data Integrity |

---

## 11. Scalability Review

1. **Catalog Growth**: Currently, `findAllByStore` retrieves all products without `LIMIT` or `OFFSET`. When a merchant reaches 500+ items, initial page load will slow down. Cursor-based or page-based pagination should be introduced before scaling past 200 items.
2. **Order Volume**: Orders table retrieves all records with `ORDER BY created_at DESC`. At 1,000+ orders, a paginated API query will be required for the merchant dashboard.
3. **Multi-Store Platform**: The database schema (`stores`, `products`, `orders`) has built-in `store_id` foreign keys. However, customer routes are currently configured in single-store mode (`STORE_ID = 1`). Transitioning to multi-tenant storefronts will require enabling slug-based routing (`/:storeSlug`).

---

## 12. Newly Discovered Issues

### [ISSUE-NEW-01] — Mobile Sticky Purchase Bar Overlaps Bottom Navigation
**Category:** UI / Layout  
**Severity:** P1 (Major Mobile UX Problem)  
**Affected files:** `src/pages/store/ProductDetail.tsx`, `src/components/layout/StoreLayout.tsx`  
**Current behavior:** `ProductDetail.tsx` renders a sticky mobile bottom purchase bar (`fixed bottom-0 z-50 md:hidden`). At the exact same viewport position, `StoreLayout.tsx` renders the mobile bottom navigation bar (`fixed bottom-0 z-40 md:hidden`) because `ProductDetail.tsx` does not pass `hideBottomNav={true}`.  
**Problem:** The purchase bar sits directly on top of the navigation bar, hiding the navigation bar and causing layout jitter.  
**Recommended behavior:** Pass `hideBottomNav={true}` to `<StoreLayout>` inside `ProductDetail.tsx`.  
**Reason:** Gives the purchase actions clean, uninterrupted thumb reach without underlying DOM collision.  
**Dependencies:** `ProductDetail.tsx`.  
**Risk:** Low.

---

### [ISSUE-NEW-02] — Search Query State is Lost on Back Navigation
**Category:** UX / Navigation  
**Severity:** P1 (Navigation Continuity)  
**Affected files:** `src/pages/store/ProductList.tsx`  
**Current behavior:** Search text is stored purely in React `useState("")`. It is not synchronized with the browser URL.  
**Problem:** When a user searches for an item, clicks a result, and then clicks browser "Back", the catalog re-renders with an empty search input and the previous results are lost.  
**Recommended behavior:** Read initial search from URL query param `?q=...` and update URL using `history.replaceState` or Wouter query navigation as the user types (debounced).  
**Reason:** Guarantees natural browser Back navigation and allows shareable search URLs.  
**Dependencies:** `ProductList.tsx`.  
**Risk:** Low.

---

### [ISSUE-NEW-03] — Coupon Code Discount Not Transmitted to Checkout / Backend
**Category:** Business Logic & Data Integrity  
**Severity:** P0 (Broken Financial Logic)  
**Affected files:** `src/pages/store/Cart.tsx`, `src/pages/store/Checkout.tsx`, `server/controllers/storeController.js`  
**Current behavior:** In `Cart.tsx`, entering `DUKKANI10` calculates a 10% discount in local state (`appliedDiscount`). When clicking "Proceed to Checkout", `appliedDiscount` is not stored in `useCart` or passed to `Checkout.tsx`. `Checkout.tsx` submits the order without discount, and the backend computes the undiscounted total.  
**Problem:** The customer is led to believe they received a discount in the cart, but the actual order is placed at full price!  
**Recommended behavior:**  
1. Store `couponCode` and `discountAmount` inside `useCart`.  
2. Display the discount row on `Checkout.tsx`.  
3. Submit `couponCode` in `createOrder` mutation.  
4. Validate coupon code on backend during order transaction and deduct verified discount from total.  
**Reason:** Prevents customer betrayal, pricing discrepancies, and financial disputes.  
**Dependencies:** `use-cart.tsx`, `Checkout.tsx`, `storeController.js`, `orderModel.js`.  
**Risk:** Medium.

---

### [ISSUE-NEW-04] — Currency Code Not Recorded in Orders Table
**Category:** Financial Data Integrity  
**Severity:** P1 (Data Integrity)  
**Affected files:** `server/models/orderModel.js`, `server/controllers/storeController.js`  
**Current behavior:** When an order is created, `OrderModel.createOrderTransaction` inserts fields into `orders` without specifying the `currency` column (it defaults to 'SAR' in PostgreSQL).  
**Problem:** If a customer checks out in USD or YER, the currency provenance is lost. The merchant dashboard formats the raw number using the store's default currency.  
**Recommended behavior:** Include `currency` in the `INSERT INTO orders` statement, recording the exact currency of the transaction.  
**Reason:** Ensures accurate financial bookkeeping and multi-currency reporting.  
**Dependencies:** `orderModel.js`, `storeController.js`.  
**Risk:** Low.

---

### [ISSUE-NEW-05] — Category Filter on Homepage Does Not Pass Selection to Catalog
**Category:** UX / Navigation Continuity  
**Severity:** P1 (Context Preservation)  
**Affected files:** `src/pages/store/Home.tsx`  
**Current behavior:** The homepage category section filters the preview grid. Clicking "استعراض كافة المنتجات" navigates to `/store/products` without any query parameters, dropping the active category filter.  
**Problem:** Shopper selected "أزياء رجالية" on the home page and clicked to see all products, but gets dumped onto an unfiltered catalog of all products.  
**Recommended behavior:** When a category is active on `Home.tsx`, link the button to `/store/products?categoryId=${selectedCategory}`.  
**Reason:** Preserves shopper intent across page transitions.  
**Dependencies:** `Home.tsx`.  
**Risk:** Low.

---

## 13. Issues That Should NOT Be Changed

1. **Single-Store Mode Architecture**: Do not arbitrarily introduce complex multi-tenant subdomain or slug routing in this phase. The current single-store setup (`/store`, `/dashboard`) is clean, fast, and meets the business requirements.
2. **Cash on Delivery (COD) & WhatsApp Fulfillment**: Do not replace COD and WhatsApp order tracking with credit card gateways (Stripe/PayPal) unless explicitly requested. In the regional target market (Yemen/Gulf), COD and direct WhatsApp communication are the primary conversion drivers.
3. **TanStack React Query Architecture**: Do not replace TanStack Query with custom fetch hooks or Redux. The existing query keys and caching architecture work efficiently.
4. **Tailwind CSS v4 Engine**: Do not migrate back to older Tailwind configurations or separate CSS modules.
5. **Wouter Router**: Do not replace Wouter with React Router v6. Wouter provides all necessary routing capabilities at a fraction of the bundle weight.

---

## 14. Issues Requiring Product Decisions

1. **Scope of Mobile Flutter App (`store_app/`)**:  
   *Decision needed*: Is `store_app/` intended to be maintained in this repository, or should it be archived/moved to a dedicated mobile repository?
2. **Promotional Coupons Policy**:  
   *Decision needed*: Should coupons be fixed hardcoded campaigns (e.g. `WELCOME`, `DUKKANI10`) validated server-side, or should merchants have a full Coupon Management CRUD tab in `/dashboard/settings`?
3. **Multi-Currency Pricing Strategy**:  
   *Decision needed*: Should products have fixed pricing per currency (e.g. 100 SAR, 6,500 YER, $25 USD set manually by merchant), or should prices dynamically convert using exchange rates?

---

## 15. Recommended Implementation Order

Following the strict priority rules:
- **P0**: Security, financial data loss, broken core functionality, blocking issues.
- **P1**: Major UX, architecture, business logic discrepancies.
- **P2**: Important usability, accessibility, and maintainability improvements.
- **P3**: Visual polish, dead code cleanup, minor enhancements.

### Phase 1: Critical Fixes (P0)
1. **[ISSUE-01] Fix `window.location.href` on Quick Add**: Replace full browser reloads in `Home.tsx:41` and `ProductList.tsx:41` with Wouter `setLocation`.
2. **[ISSUE-NEW-03] Fix Coupon / Discount Transmission**: Connect cart discount state to checkout and enforce server-side validation during order insertion so customers are charged the correct discounted amount.

### Phase 2: Flow Continuity & Major UX (P1)
3. **[ISSUE-NEW-01] Fix Mobile Purchase Bar Collision**: Pass `hideBottomNav={true}` on `ProductDetail.tsx` and `Checkout.tsx`.
4. **[ISSUE-NEW-02] URL-Synchronized Search in Catalog**: Bind search input to URL param `?q=` with autofocus support when navigating from header.
5. **[ISSUE-NEW-05] Preserve Category Filter from Home to Catalog**: Pass `?categoryId=...` when clicking "All Products" from homepage.
6. **[ISSUE-03] Extract Reusable `ProductCard`**: Eliminate ~130 lines of duplicate code between `Home.tsx` and `ProductList.tsx`.
7. **[ISSUE-04] Correct Route Semantics for About Store**: Re-route `/store/profile` to `/store/about` with backward-compatible redirect.
8. **[ISSUE-NEW-04] Record Currency Code in Orders Table**: Save transaction currency alongside order totals in the database.

### Phase 3: Accessibility, Usability & Cleanliness (P2)
9. **[ISSUE-07] Dynamic Shipping Fee in Cart Banner**: Bind shipping badge dynamically to `store.shippingRate`.
10. **Touch Target Adjustments**: Increase hit targets on announcement close button, preference close button, and cart steppers to minimum 44×44px.
11. **Color Contrast Refinement**: Adjust muted text colors in `ProductCard` to satisfy WCAG AA contrast standards.
12. **[ISSUE-08] Consolidate LocalStorage Auth Keys**: Unify on `dukkani_token`.

### Phase 4: Polish & Minor Enhancements (P3)
13. **[ISSUE-10] Orders CSV Export**: Add client-side CSV download button on merchant orders table.
14. **Clean Up Dormant UI Primitives**: Tidy up unused Radix wrapper files in `src/components/ui/`.

---

*Report finalized and verified. Standing by for user instructions.*
