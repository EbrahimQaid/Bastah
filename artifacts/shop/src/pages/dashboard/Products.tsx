import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  useListDashboardProducts,
  useDeleteDashboardProduct,
  getListDashboardProductsQueryKey
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Package, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const { data: products, isLoading } = useListDashboardProducts();
  const deleteProduct = useDeleteDashboardProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct.mutate({ productId: id }, {
        onSuccess: () => {
          toast({ title: "Product deleted" });
          queryClient.invalidateQueries({ queryKey: getListDashboardProductsQueryKey() });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Products</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {products ? `${products.length} products` : "Manage your store products"}
            </p>
          </div>
          <Link href="/dashboard/products/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-white border border-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-16 text-center">
            <Package className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-400 text-sm">No products yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first product to get started</p>
            <Link href="/dashboard/products/new">
              <button className="mt-4 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all">
                Add Product
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[56px_1fr_100px_100px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              <span>Image</span>
              <span>Name</span>
              <span>Price</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            <AnimatePresence>
              {products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[56px_1fr_100px_100px_80px] gap-4 items-center px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Image */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm truncate">{product.name}</span>
                      {product.featured && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    {product.description && (
                      <p className="text-xs text-gray-400 truncate mt-0.5 max-w-xs">{product.description}</p>
                    )}
                  </div>

                  {/* Price */}
                  <span className="font-black text-gray-900 text-sm">${product.price.toFixed(2)}</span>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${
                    product.inStock
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
                    {product.inStock ? "In Stock" : "Out"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
