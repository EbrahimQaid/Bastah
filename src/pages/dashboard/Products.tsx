import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useListDashboardProducts,
  useDeleteDashboardProduct,
  getListDashboardProductsQueryKey
} from "@/services/api";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Package, Star, Search, Filter } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const { data: products, isLoading } = useListDashboardProducts();
  const deleteProduct = useDeleteDashboardProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) {
      deleteProduct.mutate({ productId: id }, {
        onSuccess: () => {
          toast({ title: "تم حذف المنتج بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListDashboardProductsQueryKey() });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">المنتجات</h1>
            <p className="text-gray-400 font-medium mt-1">
              إدارة المخزون والمنتجات الخاصة بمتجرك.
            </p>
          </div>
          <Link href="/dashboard/products/new">
            <button className="flex items-center gap-3 px-6 py-4 bg-primary text-white text-sm font-black rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 transform hover:scale-105 active:scale-95">
              <Plus className="w-5 h-5" />
              إضافة منتج جديد
            </button>
          </Link>
        </div>

        {/* Stats & Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="md:col-span-2 relative group">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="ابحث عن منتج بالاسم أو الرمز…" 
                className="w-full pr-14 pl-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm shadow-sm"
              />
           </div>
           <div className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-bold text-gray-500">تصفية حسب:</span>
              <span className="text-sm font-black text-primary">الكل</span>
           </div>
           <div className="flex items-center justify-center gap-2 px-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm font-black text-primary">إجمالي المنتجات: {products?.length ?? 0}</span>
           </div>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-white border border-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] py-24 text-center"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900 text-lg">لا توجد منتجات حالياً</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-[250px] mx-auto font-medium">ابدأ بإضافة منتجاتك لتبدأ في البيع عبر متجرك.</p>
            <Link href="/dashboard/products/new">
              <button className="mt-8 px-8 py-4 bg-primary text-white text-sm font-black rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                إضافة أول منتج
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
                    <th className="px-8 py-5">المنتج</th>
                    <th className="px-6 py-5">السعر</th>
                    <th className="px-6 py-5">الحالة</th>
                    <th className="px-6 py-5">الأقسام</th>
                    <th className="px-8 py-5 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {products.map((product, i) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Product Info */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                              {product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Product"; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{product.name}</span>
                                {product.featured && (
                                  <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 font-bold mt-0.5 truncate max-w-[200px]">#{product.id} • {product.categoryName || "بدون قسم"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-5">
                          <span className="font-black text-gray-900 text-base">${product.price.toFixed(2)}</span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full border ${
                            product.inStock
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {product.inStock ? "متوفر" : "غير متوفر"}
                          </span>
                        </td>

                        {/* Categories (Placeholder) */}
                        <td className="px-6 py-5">
                           <span className="text-xs font-bold text-gray-500">{product.categoryName || "—"}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-start gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <Link href={`/dashboard/products/${product.id}/edit`}>
                              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all shadow-sm">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
