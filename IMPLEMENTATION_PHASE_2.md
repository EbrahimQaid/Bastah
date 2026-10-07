# دُكّـانـي (Dukkani) — Phase 2 Implementation Report

**Date:** October 1, 2026  
**Phase:** Phase 2 — P1 UX & Data Integrity Fixes  
**Status:** Completed & Verified  

---

## 1. Summary of Implemented Fixes

All six P1 issues authorized for Phase 2 have been strictly implemented according to the architectural decisions in `AUDIT_VALIDATION.md` and verified live:

### Issue 1 — Mobile Product Purchase Bar / Bottom Nav Collision
* **Files Modified**: `src/pages/store/ProductDetail.tsx`, `src/pages/store/Checkout.tsx`.
* **Fix**:
  - `StoreLayout` already supported the `hideBottomNav` prop.
  - Passed `hideBottomNav={true}` in `ProductDetail.tsx` (across loading skeleton, 404 screen, and main PDP).
  - Passed `hideBottomNav={true}` in `Checkout.tsx` (across empty bag state, order review, and confirmation).
  - Eliminates overlap between the mobile sticky action bar (`z-50`) and the mobile bottom navigation (`z-40`).
  - Desktop view remains entirely unaffected (`md:hidden`).

### Issue 2 — Search State Continuity Across Back Navigation
* **Files Modified**: `src/pages/store/ProductList.tsx`.
* **Fix**:
  - Search state initializes from URL query parameter `?q=...` via `getInitialParams`.
  - Input changes are debounced (300ms) and smoothly reflected in the URL using `window.history.replaceState` without polluting the history stack.
  - A `popstate` event listener restores search input state when the user presses browser Back / Forward.
  - Header search icon links to `/store/products?focus=search` and focuses the search input on mount.

### Issue 3 — Category Filter Continuity from Home to Catalog
* **Files Modified**: `src/pages/store/Home.tsx`, `src/pages/store/ProductList.tsx`.
* **Fix**:
  - In `Home.tsx`, the "استعراض كافة المنتجات" button dynamically includes `?categoryId=${selectedCategory}` whenever a category is active.
  - `ProductList.tsx` initializes `selectedCategory` from URL query parameter `?categoryId=...` or `?category=...`.
  - Category changes update the URL seamlessly, and browser Back / Forward navigation is handled by the `popstate` listener.

### Issue 4 — Reusable `ProductCard` Component Extraction
* **Files Modified/Created**: `src/components/store/ProductCard.tsx`, `src/pages/store/Home.tsx`, `src/pages/store/ProductList.tsx`.
* **Fix**:
  - Extracted shared product card code into `src/components/store/ProductCard.tsx`.
  - Replaced duplicate implementations in `Home.tsx` and `ProductList.tsx`.
  - Maintains Wouter client-side navigation (`setLocation`) on variant-required items.
  - Displays currency formatting, availability badges, featured highlight tag, and quick-add feedback with zero duplicate code.

### Issue 5 — Route Semantics for About Store (`/store/profile` → `/store/about`)
* **Files Modified/Created**: `src/pages/store/About.tsx`, `src/App.tsx`, `src/components/layout/StoreLayout.tsx`.
* **Fix**:
  - Created `src/pages/store/About.tsx` exporting `StoreAbout`.
  - Updated `App.tsx` routing: `/store/about` renders `StoreAbout`.
  - Maintained backward compatibility: `/store/profile` permanently redirects to `/store/about`.
  - Header and mobile bottom navigation links in `StoreLayout.tsx` link to `/store/about` with label "عن المتجر" / "المتجر".

### Issue 6 — Currency Code Recorded in Orders Table
* **Files Modified**:
  - `src/services/api.ts`: Added `currency?: string` to `Order` interface.
  - `src/pages/store/Checkout.tsx`: Submits `currency: activeCurrency` in order creation payload.
  - `server/controllers/storeController.js`: Destructures `currency` from request, validates against accepted store currencies (`SAR`, `YER`, `USD`), and passes normalized currency to transaction.
  - `server/models/orderModel.js`: Added `currency` parameter to `INSERT INTO orders` SQL query and mapped `currency` in `mapOrder`.
  - `server/lib/db.js`: Added `ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR';` and fallback state query support.
  - `src/pages/dashboard/OrderDetail.tsx` & `src/pages/dashboard/Orders.tsx`: Display the order's specific recorded transaction currency in dashboard tables and financial breakdown.

---

## 2. Verification Results

1. **Compilation (`compile_applet`)**: Succeeded with zero errors.
2. **Type Check (`lint_applet` / `tsc --noEmit`)**: Passed with zero TypeScript errors.
3. **End-to-End Live API Testing**:
   - Order placed with `currency: "YER"`, coupon `DUKKANI10`, items `productId: 1, quantity: 2`.
   - Authoritative server total calculated: `subtotal: 480`, `discount: 48`, `shipping: 0`, `total: 432`, `currency: "YER"`.
   - Authenticated merchant fetch (`/api/dashboard/orders/:id`) confirmed exact persistence: `{ id: 1001, currency: "YER", total: 432, discountAmount: 48, couponCode: "DUKKANI10" }`.
