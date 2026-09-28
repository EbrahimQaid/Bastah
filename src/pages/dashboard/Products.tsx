import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useListDashboardProducts,
  useDeleteDashboardProduct,
  useGetDashboardStore,
  getListDashboardProductsQueryKey,
} from "@/services/api";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Package, Search, Filter, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Products() {
  const { data: products, isLoading } = useListDashboardProducts();
  const { data: store } = useGetDashboardStore();
  const deleteProduct = useDeleteDashboardProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "inStock" | "outOfStock">("all");

  const currency = store?.defaultCurrency || "ر.س";

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) {
      deleteProduct.mutate(
        { productId: id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف المنتج بنجاح" });
            queryClient.invalidateQueries({ queryKey: getListDashboardProductsQueryKey() });
          },
        },
      );
    }
  };

  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(product.id).includes(searchTerm);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "inStock" && product.inStock) ||
        (filterStatus === "outOfStock" && !product.inStock);
      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              إدارة المنتجات
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
              إضافة المنتجات وتعديل الأسعار والمخزون في متجرك.
            </p>
          </div>
          <Link href="/dashboard/products/new">
            <button className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-xs">
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم أو الرمز التعريف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <div className="flex-1 relative">
              <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full pr-9 pl-3 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:border-red-600 font-bold text-neutral-700 dark:text-zinc-300 cursor-pointer"
              >
                <option value="all">كافة الحالات</option>
                <option value="inStock">متوفر فقط</option>
                <option value="outOfStock">غير متوفر</option>
              </select>
            </div>
            <div className="px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-zinc-800 text-[11px] font-bold text-neutral-600 dark:text-zinc-400 whitespace-nowrap">
              العدد: {filteredProducts.length}
            </div>
          </div>
        </div>

        {/* Products Table Card */}
        {isLoading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl py-16 px-6 text-center space-y-3">
            <Package className="w-10 h-10 mx-auto text-neutral-300" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">لا توجد منتجات مسجلة</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              ابدأ بإضافة منتجك الأول لتظهر في واجهة المتجر وتستقبل طلبات العملاء فوراً.
            </p>
            <Link href="/dashboard/products/new">
              <button className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors">
                إضافة أول منتج
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400 font-bold">
                لا توجد منتجات تطابق خيارات التصفية الحالية.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-zinc-800/50 border-b border-neutral-200/80 dark:border-zinc-800 text-neutral-500 font-bold">
                      <th className="px-5 py-3.5">المنتج</th>
                      <th className="px-4 py-3.5">السعر</th>
                      <th className="px-4 py-3.5">الحالة</th>
                      <th className="px-4 py-3.5">القسم</th>
                      <th className="px-5 py-3.5 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-zinc-800/80">
                    {filteredProducts.map((product) => {
                      const imageSrc =
                        Array.isArray(product.images) && product.images.length > 0
                          ? product.images[0]
                          : typeof product.images === "string" && product.images
                          ? product.images
                          : undefined;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-neutral-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Image & Title */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-100 dark:bg-zinc-800 shrink-0 border border-neutral-200 dark:border-zinc-700">
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                    {product.name}
                                  </span>
                                  {product.featured && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
                                      مميّز
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                                  #{product.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-neutral-900 dark:text-white">
                              {product.price.toLocaleString("ar-SA", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}{" "}
                              <span className="text-[10px] font-sans font-normal text-neutral-400">
                                {currency}
                              </span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                product.inStock
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  product.inStock ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              {product.inStock ? "متوفر" : "نفد المخزون"}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5 text-neutral-500">
                            {product.categoryName || "—"}
                          </td>

                          {/* Actions - Always accessible on mobile & desktop */}
                          <td className="px-5 py-3.5 text-left">
                            <div className="flex items-center justify-start gap-1">
                              <Link href={`/dashboard/products/${product.id}/edit`}>
                                <button
                                  className="p-1.5 rounded-lg text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
                                  title="تعديل المنتج"
                                  aria-label="تعديل"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="حذف المنتج"
                                aria-label="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
