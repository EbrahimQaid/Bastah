import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  useListDashboardCategories,
  useCreateDashboardCategory,
  useDeleteDashboardCategory,
  getListDashboardCategoriesQueryKey
} from "@/services/api";
import { Trash2, Plus, Tag, Search, MoreVertical } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = [
  "bg-rose-50 text-rose-600 border-rose-100", 
  "bg-blue-50 text-blue-600 border-blue-100", 
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-violet-50 text-violet-600 border-violet-100", 
  "bg-amber-50 text-amber-600 border-amber-100", 
  "bg-pink-50 text-pink-600 border-pink-100",
  "bg-teal-50 text-teal-600 border-teal-100", 
  "bg-orange-50 text-orange-600 border-orange-100",
];

export default function Categories() {
  const { data: categories, isLoading } = useListDashboardCategories();
  const createCategory = useCreateDashboardCategory();
  const deleteCategory = useDeleteDashboardCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newCatName, setNewCatName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCategory.mutate({ data: { name: newCatName.trim() } }, {
      onSuccess: () => {
        setNewCatName("");
        toast({ title: "تمت إضافة القسم بنجاح" });
        queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل أنت متأكد من حذف قسم "${name}"؟`)) {
      deleteCategory.mutate({ categoryId: id }, {
        onSuccess: () => {
          toast({ title: "تم حذف القسم" });
          queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-4xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">الأقسام</h1>
            <p className="text-gray-400 font-medium mt-2">نظم منتجاتك في أقسام ليسهل على عملائك العثور عليها.</p>
          </div>
          <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
             <p className="text-primary text-xs font-black">إجمالي الأقسام: {categories?.length ?? 0}</p>
          </div>
        </div>

        {/* Add Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm"
        >
          <h3 className="font-black text-gray-900 mb-6">إضافة قسم جديد</h3>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Tag className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input
                placeholder="اسم القسم (مثلاً: ملابس رجالية، أحذية...)"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                className="w-full pr-14 pl-6 py-4 text-sm bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 placeholder:text-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={createCategory.isPending || !newCatName.trim()}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white text-sm font-black rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
            >
              {createCategory.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              إضافة القسم
            </button>
          </form>
        </motion.div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="font-black text-gray-900">الأقسام الحالية</h3>
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100">
               <Search className="w-3.5 h-3.5" />
               بحث…
             </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white border border-gray-50 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 ${PALETTE[i % PALETTE.length]} transition-transform group-hover:scale-110 duration-500`}>
                        {cat.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-black text-gray-900 text-base truncate group-hover:text-primary transition-colors">{cat.name}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">رقم القسم: #{cat.id}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-50/50 rounded-full group-hover:bg-primary/5 transition-colors duration-500" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] py-24 text-center"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="font-black text-gray-900 text-lg">لا توجد أقسام حالياً</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-[250px] mx-auto font-medium">ابدأ بتنظيم متجرك عن طريق إضافة أول قسم لك في النموذج أعلاه.</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
