/**
 * 📡 API Service — بَسطة (Single Store)
 *
 * Simple fetch + react-query hooks.
 * Single-store mode: no slug routing needed.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Store Config ──────────────────────────────────────────
export const STORE_SLUG = "bastah"; // kept for backwards compat references

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
  shippingRate: number;
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
  const token = localStorage.getItem("bastah_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    headers,
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
  store: () => ["store"] as const,
  storeProducts: (filters?: Record<string, any>) => ["storeProducts", filters] as const,
  storeProduct: (id: number) => ["storeProduct", id] as const,
  storeCategories: () => ["storeCategories"] as const,
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

/** GET /api/store */
export function useGetStore(_slug?: string, options?: { query?: any }) {
  return useQuery({
    queryKey: queryKeys.store(),
    queryFn: () => apiFetch<Store>(`/store`),
    ...options?.query,
  });
}

export function getGetStoreQueryKey() {
  return queryKeys.store();
}

/** GET /api/store/products */
export function useListStoreProducts(_slug?: string, filters?: { search?: string; categoryId?: number }) {
  return useQuery({
    queryKey: queryKeys.storeProducts(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.categoryId) params.set("categoryId", String(filters.categoryId));
      const qs = params.toString();
      return apiFetch<Product[]>(`/store/products${qs ? `?${qs}` : ""}`);
    },
  });
}

/** GET /api/store/products/:id */
export function useGetStoreProduct(_slug: string | undefined, productId: number) {
  return useQuery({
    queryKey: queryKeys.storeProduct(productId),
    queryFn: () => apiFetch<Product>(`/store/products/${productId}`),
    enabled: productId > 0,
  });
}

/** GET /api/store/categories */
export function useListStoreCategories(_slug?: string) {
  return useQuery({
    queryKey: queryKeys.storeCategories(),
    queryFn: () => apiFetch<Category[]>(`/store/categories`),
  });
}

/** POST /api/store/orders */
export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ data }: { data: any }) => {
      return apiFetch<Order>(`/store/orders`, {
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
