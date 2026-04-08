# Workspace

## Overview

Multi-vendor e-commerce platform for small sellers using WhatsApp as a backend communication tool. Customers shop through beautiful mini-stores; sellers manage everything through a dashboard. WhatsApp is hidden from customers and used only for order notifications.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Wouter

## Architecture

- `artifacts/api-server` — Express 5 REST API
- `artifacts/shop` — React + Vite storefront + seller dashboard
- `lib/db` — Drizzle ORM schema (stores, categories, products, orders)
- `lib/api-spec` — OpenAPI spec (source of truth)
- `lib/api-client-react` — Generated React Query hooks
- `lib/api-zod` — Generated Zod validation schemas

## Key Routes

### Customer Store
- `/` — Landing page
- `/store/:storeSlug` — Store home with featured products and categories
- `/store/:storeSlug/products` — Product listing with search/filters
- `/store/:storeSlug/products/:productId` — Product detail
- `/store/:storeSlug/cart` — Shopping cart (client-side, localStorage)
- `/store/:storeSlug/checkout` — Checkout form → places order

### Seller Dashboard
- `/dashboard` — Overview stats + recent orders
- `/dashboard/products` — Product CRUD
- `/dashboard/categories` — Category management
- `/dashboard/orders` — Orders list (new/contacted/completed)
- `/dashboard/orders/:id` — Order detail with WhatsApp button
- `/dashboard/settings` — Store branding (name, color, images, WhatsApp number)
- `/dashboard/setup` — First-time store setup

## Demo Data
- Store slug: `demo-store` (Zara Style Boutique)
- 6 products seeded across 4 categories
- 3 sample orders (new, contacted, completed)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
