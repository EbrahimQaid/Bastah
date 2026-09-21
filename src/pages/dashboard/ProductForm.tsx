import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  useCreateDashboardProduct,
  useUpdateDashboardProduct,
  useListDashboardProducts,
  useListDashboardCategories,
  getListDashboardProductsQueryKey,
} from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Tag, DollarSign, AlignLeft, Ruler, Palette, Star, Package, Images } from "lucide-react";

function FormField({ label, icon: Icon, hint, children }: { label: string; icon: React.ElementType; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:font-normal placeholder:text-gray-400";

export default function ProductForm() {
  const [match, params] = useRoute("/dashboard/products/:productId/edit");
  const isEdit = !!match;
  const productId = parseInt(params?.productId || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products } = useListDashboardProducts({
    query: { queryKey: getListDashboardProductsQueryKey(), enabled: isEdit },
  });
  const { data: categories } = useListDashboardCategories();
  const product = products?.find(p => p.id === productId);

  const createProduct = useCreateDashboardProduct();
  const updateProduct = useUpdateDashboardProduct();

  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    images: [] as string[],
    sizes: "",
    colors: "",
    categoryId: "",
    inStock: true,
    featured: false,
  });

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name,
        price: product.price,
        description: product.description || "",
        images: product.images || [],
        sizes: product.variants?.sizes?.join(", ") || "",
        colors: product.variants?.colors?.join(", ") || "",
        categoryId: product.categoryId ? String(product.categoryId) : "",
        inStock: product.inStock,
        featured: product.featured,
      });
    }
  }, [isEdit, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      images: form.images,
      variants: {
        sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
      },
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      inStock: form.inStock,
      featured: form.featured,
    };

    const onSuccess = () => {
      toast({ title: isEdit ? "Product updated!" : "Product created!" });
      queryClient.invalidateQueries({ queryKey: getListDashboardProductsQueryKey() });
      setLocation("/dashboard/products");
    };

    if (isEdit) {
      updateProduct.mutate({ productId, data }, { onSuccess });
    } else {
      createProduct.mutate({ data }, { onSuccess });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEdit ? "Edit Product" : "Add Product"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {isEdit ? `Editing: ${product?.name}` : "Fill in the details to add a new product"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide text-gray-400">Basic Info</h3>

            <FormField label="Product Name" icon={Package}>
              <input
                required
                className={inputCls}
                placeholder="e.g. Silk Blend Blouse"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Price (USD)" icon={DollarSign}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputCls}
                  placeholder="0.00"
                  value={form.price || ""}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                />
              </FormField>

              <FormField label="Category" icon={Tag}>
                <select
                  className={inputCls}
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">No category</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="Description" icon={AlignLeft}>
              <textarea
                className={`${inputCls} h-24 resize-none`}
                placeholder="Describe your product…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </FormField>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="flex items-center gap-2 font-black text-gray-900 text-sm uppercase tracking-wide text-gray-400">
              <Images className="w-4 h-4" />
              الصور
            </h3>
            <ImageUploader
              images={form.images}
              onChange={imgs => setForm({ ...form, images: imgs })}
              maxImages={5}
            />
          </div>

          {/* Variants */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide text-gray-400">Variants</h3>

            <FormField label="Sizes" icon={Ruler} hint="Separate with commas, e.g. S, M, L, XL">
              <input
                className={inputCls}
                placeholder="S, M, L, XL"
                value={form.sizes}
                onChange={e => setForm({ ...form, sizes: e.target.value })}
              />
            </FormField>

            <FormField label="Colors" icon={Palette} hint="Names or hex codes, e.g. Black, White, #C1121F">
              <input
                className={inputCls}
                placeholder="Black, White, Red"
                value={form.colors}
                onChange={e => setForm({ ...form, colors: e.target.value })}
              />
            </FormField>
          </div>

          {/* Toggles */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide text-gray-400 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold text-sm text-gray-900">In Stock</p>
                  <p className="text-xs text-gray-400">Product is available for purchase</p>
                </div>
                <Switch checked={form.inStock} onCheckedChange={c => setForm({ ...form, inStock: c })} />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-bold text-sm text-gray-900">Featured</p>
                    <p className="text-xs text-gray-400">Show on store home page</p>
                  </div>
                </div>
                <Switch checked={form.featured} onCheckedChange={c => setForm({ ...form, featured: c })} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-8">
            <Link href="/dashboard/products" className="flex-1">
              <button type="button" className="w-full py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
