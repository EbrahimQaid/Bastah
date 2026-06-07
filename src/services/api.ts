/**
 * 📡 API Service — Vendor Connect (Single Store)
 *
 * Simple fetch + react-query hooks to replace @workspace/api-client-react.
 * All hooks are self-contained — no external workspace dependencies.
 *
 * الباكند ← أنت تبنيه بنفسك (Node.js + Express + PostgreSQL)
 * هذا الملف يتصل بالـ API endpoints اللي رح تبنيها
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Store Config ──────────────────────────────────────────
// غيّر هذا لاسم المتجر الخاص بك (slug)
export const STORE_SLUG = "bastah";

// ─── Types ─────────────────────────────────────────────────

export interface Store {
  id: number;
  slug: string;
  name: string;
  description: string;
  coverImage: string;
  logoImage: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  currencies: string;
  defaultCurrency: string;
  themeConfig: string | null;
  whatsappNumber: string;
  createdAt: string;
}

export interface Product {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: { sizes: string[]; colors: string[] };
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  storeId: number;
  name: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  imageUrl?: string;
}

export interface Order {
  id: number;
  storeId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  items: OrderItem[];
  total: number;
  status: string;
  whatsappMessage: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export type UpdateOrderStatusBodyStatus = "new" | "contacted" | "completed";

// ─── Fetch Helper ──────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Query Keys ────────────────────────────────────────────

export const queryKeys = {
  store: () => ["store", STORE_SLUG] as const,
  storeProducts: (filters?: Record<string, any>) => ["storeProducts", STORE_SLUG, filters] as const,
  storeProduct: (id: number) => ["storeProduct", STORE_SLUG, id] as const,
  storeCategories: () => ["storeCategories", STORE_SLUG] as const,
  dashboardStore: () => ["dashboardStore"] as const,
  dashboardProducts: () => ["dashboardProducts"] as const,
  dashboardCategories: () => ["dashboardCategories"] as const,
  dashboardOrders: () => ["dashboardOrders"] as const,
  dashboardOrder: (id: number) => ["dashboardOrder", id] as const,
  dashboardStats: () => ["dashboardStats"] as const,
};

// ════════════════════════════════════════════════════════════
//  PUBLIC STORE HOOKS (الواجهة العامة للعملاء)
// ════════════════════════════════════════════════════════════

/** GET /api/stores/:slug */
export function useGetStore(slug?: string, options?: { query?: any }) {
  const storeSlug = slug || STORE_SLUG;
  return useQuery({
    queryKey: queryKeys.store(),
    queryFn: () => apiFetch<Store>(`/stores/${storeSlug}`),
    ...options?.query,
  });
}

export function getGetStoreQueryKey(slug?: string) {
  return queryKeys.store();
}

/** GET /api/stores/:slug/products */
export function useListStoreProducts(slug?: string, filters?: { search?: string; categoryId?: number }) {
  const storeSlug = slug || STORE_SLUG;
  return useQuery({
    queryKey: queryKeys.storeProducts(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.categoryId) params.set("categoryId", String(filters.categoryId));
      const qs = params.toString();
      return apiFetch<Product[]>(`/stores/${storeSlug}/products${qs ? `?${qs}` : ""}`);
    },
  });
}

/** GET /api/stores/:slug/products/:id */
export function useGetStoreProduct(slug: string | undefined, productId: number) {
  const storeSlug = slug || STORE_SLUG;
  return useQuery({
    queryKey: queryKeys.storeProduct(productId),
    queryFn: () => apiFetch<Product>(`/stores/${storeSlug}/products/${productId}`),
    enabled: productId > 0,
  });
}

/** GET /api/stores/:slug/categories */
export function useListStoreCategories(slug?: string) {
  const storeSlug = slug || STORE_SLUG;
  return useQuery({
    queryKey: queryKeys.storeCategories(),
    queryFn: () => apiFetch<Category[]>(`/stores/${storeSlug}/categories`),
  });
}

/** POST /api/stores/:slug/orders */
export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ storeSlug, data }: { storeSlug?: string; data: any }) => {
      const slug = storeSlug || STORE_SLUG;
      return apiFetch<Order>(`/stores/${slug}/orders`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  });
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD HOOKS (لوحة تحكم البائع)
// ════════════════════════════════════════════════════════════

/** GET /api/dashboard/store */
export function useGetDashboardStore() {
  return useQuery({
    queryKey: queryKeys.dashboardStore(),
    queryFn: () => apiFetch<Store>("/dashboard/store"),
  });
}

export function getGetDashboardStoreQueryKey() {
  return queryKeys.dashboardStore();
}

/** PUT /api/dashboard/store */
export function useUpdateDashboardStore() {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch<Store>("/dashboard/store", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

/** POST /api/dashboard/store/init */
export function useInitDashboardStore() {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch<Store>("/dashboard/store/init", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

/** GET /api/dashboard/products */
export function useListDashboardProducts(options?: { query?: any }) {
  return useQuery({
    queryKey: queryKeys.dashboardProducts(),
    queryFn: () => apiFetch<Product[]>("/dashboard/products"),
    ...options?.query,
  });
}

export function getListDashboardProductsQueryKey() {
  return queryKeys.dashboardProducts();
}

/** POST /api/dashboard/products */
export function useCreateDashboardProduct() {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch<Product>("/dashboard/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

/** PUT /api/dashboard/products/:id */
export function useUpdateDashboardProduct() {
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: any }) =>
      apiFetch<Product>(`/dashboard/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

/** DELETE /api/dashboard/products/:id */
export function useDeleteDashboardProduct() {
  return useMutation({
    mutationFn: ({ productId }: { productId: number }) =>
      fetch(`/api/dashboard/products/${productId}`, { method: "DELETE" }).then(() => undefined),
  });
}

/** GET /api/dashboard/categories */
export function useListDashboardCategories() {
  return useQuery({
    queryKey: queryKeys.dashboardCategories(),
    queryFn: () => apiFetch<Category[]>("/dashboard/categories"),
  });
}

export function getListDashboardCategoriesQueryKey() {
  return queryKeys.dashboardCategories();
}

/** POST /api/dashboard/categories */
export function useCreateDashboardCategory() {
  return useMutation({
    mutationFn: ({ data }: { data: { name: string } }) =>
      apiFetch<Category>("/dashboard/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

/** DELETE /api/dashboard/categories/:id */
export function useDeleteDashboardCategory() {
  return useMutation({
    mutationFn: ({ categoryId }: { categoryId: number }) =>
      fetch(`/api/dashboard/categories/${categoryId}`, { method: "DELETE" }).then(() => undefined),
  });
}

/** GET /api/dashboard/orders */
export function useListDashboardOrders() {
  return useQuery({
    queryKey: queryKeys.dashboardOrders(),
    queryFn: () => apiFetch<Order[]>("/dashboard/orders"),
  });
}

export function getListDashboardOrdersQueryKey() {
  return queryKeys.dashboardOrders();
}

/** GET /api/dashboard/orders/:id */
export function useGetDashboardOrder(orderId: number, options?: { query?: any }) {
  return useQuery({
    queryKey: queryKeys.dashboardOrder(orderId),
    queryFn: () => apiFetch<Order>(`/dashboard/orders/${orderId}`),
    enabled: orderId > 0,
    ...options?.query,
  });
}

export function getGetDashboardOrderQueryKey(orderId: number) {
  return queryKeys.dashboardOrder(orderId);
}

/** PUT /api/dashboard/orders/:id */
export function useUpdateDashboardOrderStatus() {
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: { status: string } }) =>
      apiFetch<Order>(`/dashboard/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  });
}

/** GET /api/dashboard/stats */
export function useGetDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: () => apiFetch<DashboardStats>("/dashboard/stats"),
  });
}
