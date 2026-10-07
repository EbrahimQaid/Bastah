# دُكّـانـي (Dukkani) — Phase 1 Critical Functional Fixes Implementation Report

**Date:** September 29, 2026  
**Phase:** Phase 1 — Critical Functional & Data Integrity Fixes  
**Status:** Successfully Implemented, Verified, and Audited  
**Strict Scope Rule Observed:** No visual redesign, no route renaming, no dependency additions, and no premature P1/P2/P3 feature implementations.

---

## 1. Issues Fixed

### Issue 1 — Coupon / Discount Financial Integrity (P0)
* **Root Problem**: The cart allowed shoppers to apply coupons in-memory (`Cart.tsx`), displaying a 10% discount locally. However, when navigating to `/store/checkout`, the discount was lost, was not transmitted, and the backend calculated the order total exclusively from base product prices without applying any discount. This created a severe trust and financial mismatch between what the customer was promised in the cart and what the server actually stored in the database.
* **Resolution**:
  - Implemented authoritative server-side coupon validation (`validateCouponCode` and `POST /api/store/coupons/validate`).
  - Added coupon state persistence in `useCart` (`cart_coupon` in `localStorage`), ensuring the coupon and discount survive navigation from Cart to Checkout.
  - Displayed the coupon code and discount line on `Checkout.tsx` and in the final `OrderSuccess.tsx` receipt.
  - Transmitted `couponCode` in `createOrder` mutation.
  - The server independently validates `couponCode`, recalculates product prices from the database, computes `verifiedDiscountAmount`, applies `shippingRate`, and stores `subtotal`, `discount_amount`, `shipping_amount`, `total`, and `coupon_code` in the database.
  - The client is **never** trusted for discount amounts, subtotals, or order totals.

### Issue 2 — Quick Add Variant Navigation (P0)
* **Root Problem**: In `Home.tsx` (line 41) and `ProductList.tsx` (line 41), clicking the "Quick Add" button on a product with size or color variants executed `window.location.href = \`/store/products/\${product.id}\``. This forced a full browser reload, unmounted the entire React SPA tree, threw away the in-memory React Query cache, and broke mobile SPA continuity.
* **Resolution**:
  - Replaced `window.location.href` with Wouter's native client-side navigation (`useLocation` -> `setLocation(\`/store/products/\${product.id}\`)`).
  - The React application stays mounted, query cache is preserved, and page transitions are instantaneous without page flicker.

---

## 2. Files Changed

| File | Subsystem | Nature of Change |
| :--- | :--- | :--- |
| `server/controllers/storeController.js` | Backend Controller | Added `validateCouponCode` rule engine, `validateCoupon` API endpoint, and authoritative discount calculation in `createOrder`. |
| `server/routes/storeRoutes.js` | Backend Routing | Registered `POST /api/store/coupons/validate` route. |
| `server/models/orderModel.js` | Database Model | Extended `createOrderTransaction` and `mapOrder` to insert and return `discount_amount` and `coupon_code`. |
| `server/lib/db.js` | Database & Mock DB | Added migration check for `discount_amount`/`coupon_code` and updated `fallbackState` to record and query discounts. |
| `src/hooks/use-cart.tsx` | Client State | Added `appliedCoupon` state, `applyCoupon`, `removeCoupon`, `discountAmount`, and `finalTotal` to `useCart`. |
| `src/services/api.ts` | Client API Layer | Extended `Order` interface with `subtotal`, `discountAmount`, `shippingAmount`, `couponCode`, and `orderNumber`. |
| `src/pages/store/Cart.tsx` | Storefront View | Replaced mock local validation with live `POST /api/store/coupons/validate` call, added remove coupon button, and bound summary to `useCart`. |
| `src/pages/store/Checkout.tsx` | Storefront View | Reads `appliedCoupon`, renders discount line in summary, submits `couponCode` to server, and records authoritative receipt. |
| `src/pages/store/OrderSuccess.tsx` | Storefront View | Displays verified discount line and coupon badge in customer order receipt. |
| `src/pages/dashboard/OrderDetail.tsx` | Merchant View | Itemized financial breakdown showing subtotal, coupon badge, discount amount, shipping fee, and grand total. |
| `src/pages/store/Home.tsx` | Storefront View | Replaced `window.location.href` with Wouter `setLocation` in `ProductCard`. |
| `src/pages/store/ProductList.tsx` | Storefront View | Replaced `window.location.href` with Wouter `setLocation` in `ProductCard`. |

---

## 3. Architecture Decisions

1. **Server as Single Source of Truth**:
   - The client only transmits `items` (productId, quantity, variants) and an optional `couponCode`.
   - The server resolves product records from the database, sums prices, checks the coupon validity, computes verified discount, adds shipping, and computes final total.
   - Any client-submitted `price`, `discountAmount`, or `total` is strictly ignored.
2. **Backward-Compatible Server Campaign Fallback**:
   - Instead of immediately forcing a complex merchant coupon CRUD system, the server checks the existing database `coupons` table and provides fallback rules for the established regional campaign codes (`DUKKANI10`, `SAVE10`, `WELCOME`, `DUKKANI`).
3. **Session Receipt Persistence**:
   - When `createOrder` succeeds, the exact server-returned payload (with verified subtotal, discount, and total) is stored into `sessionStorage` under `dukkani_receipt_${orderId}`. This guarantees that `OrderSuccess.tsx` renders the server's authoritative values without trusting client cart state.

---

## 4. Coupon Trust Boundary

```
[Customer Cart]
  │  Enters coupon: "DUKKANI10"
  ├──► POST /api/store/coupons/validate { code: "DUKKANI10" }
  ◄─── Returns { valid: true, discountPercent: 10 }
  │
[Customer Checkout]
  │  Submits order with { ...form, items, couponCode: "DUKKANI10" }
  │  (No discount amount or total is accepted from client)
  ▼
[Server Controller: storeController.createOrder]
  │  1. Verifies customer data and items
  │  2. Fetches product prices from DB: sum = 240
  │  3. Validates coupon "DUKKANI10" server-side: 10% discount = 24
  │  4. Fetches store shipping rate: 0
  │  5. Calculates: total = (240 - 24) + 0 = 216
  │  6. Executes DB Transaction:
  │     INSERT INTO orders (subtotal, discount_amount, shipping_amount, total, coupon_code...)
  │     VALUES (240, 24, 0, 216, 'DUKKANI10'...)
  ▼
[Database (PostgreSQL / In-Memory Mock)]
  Stores persistent record with authoritative financial values.
```

---

## 5. Database Changes

The `orders` table in `supabase-schema.sql` already defined:
```sql
discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
coupon_code     TEXT,
```
To guarantee backward-compatibility on existing databases, `server/lib/db.js` runs a non-destructive migration on startup:
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
```
In the in-memory fallback state (`server/lib/db.js`), `handleFallbackQuery` was upgraded to store and query `discount_amount` and `coupon_code`.

---

## 6. API Contract Changes

### New Route
* **`POST /api/store/coupons/validate`**
  - **Request Body**: `{ "code": "DUKKANI10" }`
  - **Success Response (200)**:
    ```json
    {
      "valid": true,
      "code": "DUKKANI10",
      "type": "percent",
      "discountPercent": 10,
      "description": "خصم 10% على إجمالي المنتجات"
    }
    ```
  - **Error Response (400)**:
    ```json
    {
      "valid": false,
      "error": "كود الخصم غير صالح أو غير موجود"
    }
    ```

### Updated Route
* **`POST /api/store/orders`**
  - **Accepted Payload (optional addition)**: `"couponCode": "DUKKANI10"`
  - **Server-Generated Response**: Returns `discountAmount` and `couponCode` alongside `subtotal`, `shippingAmount`, and `total`.

---

## 7. Testing Performed & Verified Scenarios

All required test scenarios were executed and verified via direct API requests and integration checks:

| Test Scenario | Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Scenario A: Valid Coupon** | `POST /api/store/orders` with product price 240 and coupon `DUKKANI10`. | Subtotal: 240, Discount: 24 (10%), Total: 216. | `subtotal: 240`, `discountAmount: 24`, `total: 216`, `couponCode: "DUKKANI10"`. | **PASS** |
| **Scenario B: Invalid Coupon** | `POST /api/store/coupons/validate` with `FAKECODE99`. | 400 Bad Request with error description. | `400: {"valid":false,"error":"كود الخصم غير صالح أو غير موجود"}`. | **PASS** |
| **Scenario C: Manipulated discountAmount** | Client submits `{ couponCode: "DUKKANI10", discountAmount: 200, items: [...] }`. | Server ignores 200, recalculates 24, total 216. | Server created order with `discountAmount: 24` and `total: 216`. | **PASS** |
| **Scenario D: Manipulated total** | Client submits `{ couponCode: "DUKKANI10", total: 1, items: [...] }`. | Server ignores 1, recalculates 216. | Server created order with `total: 216`. | **PASS** |
| **Scenario E: Manipulated product price** | Client submits `{ items: [{ productId: 1, price: 10 }] }`. | Server ignores 10, pulls database price (240). | Server created order with `subtotal: 240` and `total: 240`. | **PASS** |
| **Scenario F: Order without Coupon** | Client submits standard order without coupon. | Subtotal: 240, Discount: 0, Total: 240. | `subtotal: 240`, `discountAmount: 0`, `total: 240`, `couponCode: null`. | **PASS** |
| **Quick Add: Product without variants** | Clicks Quick Add on product without variants. | Adds to cart in-place, opens drawer. | Existing cart addition preserved. | **PASS** |
| **Quick Add: Product with variants** | Clicks Quick Add on product with variants in `Home.tsx` / `ProductList.tsx`. | Client-side navigation via Wouter to `/store/products/:id` without browser reload. | SPA transition verified; React app remained mounted with zero reload. | **PASS** |

---

## 8. Build & Typecheck Results

1. **TypeScript Linting (`tsc --noEmit`)**:
   ```
   > dukkani@1.0.0 lint
   > tsc --noEmit
   (Exited with 0 errors)
   ```
2. **Production Applet Compilation (`compile_applet`)**:
   ```
   Build succeeded - the applet is compiled.
   ```
3. **Dead Code & Reference Verification**:
   - Zero instances of `window.location.href = ...` remain in catalog or quick-add code.

---

## 9. Remaining Known Issues (Scheduled for Subsequent Phases)

In accordance with the Strict Scope Rule, the following items remain unaddressed for Phase 2:
- Catalog Search URL synchronization (`?q=...`) and auto-focus from header.
- Category filter persistence when navigating from Home to `/store/products`.
- ProductCard component consolidation across `Home.tsx` and `ProductList.tsx`.
- Semantic route correction for `/store/profile` -> `/store/about`.
- Mobile sticky purchase bar z-index and `hideBottomNav` coordination on `ProductDetail.tsx`.
- Touch target and WCAG AA contrast adjustments.

---
*Phase 1 Implementation Complete. Awaiting approval to proceed.*
