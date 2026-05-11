import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import {
  useListDashboardCategories,
  useCreateDashboardCategory,
  useDeleteDashboardCategory,
  getListDashboardCategoriesQueryKey
} from "@workspace/api-client-react";
import { Trash2, Plus, Tag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = [
  "bg-red-100 text-red-700", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700", "bg-amber-100 text-amber-700", "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700", "bg-orange-100 text-orange-700",
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
        toast({ title: "Category added" });
        queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteCategory.mutate({ categoryId: id }, {
        onSuccess: () => {
          toast({ title: "Category deleted" });
          queryClient.invalidateQueries({ queryKey: getListDashboardCategoriesQueryKey() });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your products into categories.</p>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="relative flex-1">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="New category name…"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={createCategory.isPending || !newCatName.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-white border border-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                {categories.length} categories
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${PALETTE[i % PALETTE.length]}`}>
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-14 text-center">
            <Tag className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-bold text-gray-400">No categories yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first category above</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
