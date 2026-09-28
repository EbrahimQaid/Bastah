import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  useListDashboardCategories,
  useCreateDashboardCategory,
  useDeleteDashboardCategory,
  useListDashboardProducts,
  getListDashboardCategoriesQueryKey,
} from "@/services/api";
import { Trash2, Plus, Tag, Search, Folder } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Categories() {
  const { data: categories, isLoading } = useListDashboardCategories();
  const { data: products } = useListDashboardProducts();
  const createCategory = useCreateDashboardCategory();
  const deleteCategory = useDeleteDashboardCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newCatName, setNewCatName] = useState("");
  const [search, setSearch] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCategory.mutate(
      { data: { name: newCatName.trim() } },
      {
        onSuccess: () => {
          setNewCatName("");
          toast({ title: "تمت إضافة القسم بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
        },
      },
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل أنت متأكد من حذف قسم "${name}"؟`)) {
      deleteCategory.mutate(
        { categoryId: id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف القسم" });
            queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
          },
        },
      );
    }
  };

  const filteredCategories =
    categories?.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())) ?? [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              أقسام المتجر
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
              تنظيم وتصنيف المنتجات لتسهيل تجربة التصفح والبحث على العملاء.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-zinc-800 text-[11px] font-bold text-neutral-600 dark:text-zinc-400 self-start sm:self-auto">
            إجمالي الأقسام: {categories?.length ?? 0}
          </div>
        </div>

        {/* Add Category Form Card */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
            إضافة قسم جديد
          </h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="اسم القسم (مثال: أزياء رجالية، عطور ملكية، إكسسوارات...)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-xs bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={createCategory.isPending || !newCatName.trim()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xs"
            >
              {createCategory.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>إضافة القسم</span>
            </button>
          </form>
        </div>

        {/* Search & List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white">الأقسام الحالية</h3>
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="تصفية الأقسام..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl focus:outline-hidden font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-neutral-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl py-12 text-center text-xs text-neutral-400">
              {categories && categories.length > 0
                ? "لا توجد أقسام تطابق البحث."
                : "لم يتم إنشاء أقسام بعد. استخدم النموذج أعلاه لإضافة قسمك الأول."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCategories.map((cat) => {
                const count =
                  products?.filter(
                    (p) => p.categoryId === cat.id || (p as any).category_id === cat.id,
                  ).length ?? 0;

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-700 dark:text-zinc-300 shrink-0">
                        <Folder className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {cat.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {count} {count === 1 ? "منتج" : count === 2 ? "منتجان" : "منتجات"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="حذف القسم"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
