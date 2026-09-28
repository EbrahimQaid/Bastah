import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import {
  useCreateDashboardProduct,
  useUpdateDashboardProduct,
  useListDashboardProducts,
  useListDashboardCategories,
  useGetDashboardStore,
  getListDashboardProductsQueryKey,
} from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Tag, DollarSign, Package, Check, Save } from "lucide-react";

function FormField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-neutral-800 dark:text-zinc-200">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400";

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
  const { data: store } = useGetDashboardStore();
  const product = products?.find((p) => p.id === productId);

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

  const currency = store?.defaultCurrency || "ر.س";

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
    if (!form.name.trim()) {
      toast({ title: "يرجى كتابة اسم المنتج", variant: "destructive" });
      return;
    }
    if (form.price <= 0) {
      toast({ title: "يرجى تحديد سعر صالح للمنتج", variant: "destructive" });
      return;
    }

    const data = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      images: form.images,
      variants: {
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      },
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      inStock: form.inStock,
      featured: form.featured,
    };

    const onSuccess = () => {
      toast({ title: isEdit ? "تم تحديث بيانات المنتج بنجاح" : "تمت إضافة المنتج للكتالوج بنجاح" });
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
      <div className="max-w-3xl space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <Link href="/dashboard/products">
            <button
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-100 transition-colors"
              aria-label="الرجوع"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isEdit ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">
              {isEdit ? `تعديل: ${product?.name || ""}` : "أدخل تفاصيل وسعر ومواصفات المنتج الجديد"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              المعلومات الأساسية
            </h3>

            <FormField label="اسم المنتج" required>
              <input
                required
                className={inputCls}
                placeholder="مثال: ثوب قطن كلاسيكي فاخر"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={`السعر (${currency})`} required>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className={inputCls}
                    placeholder="0.00"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </FormField>

              <FormField label="القسم">
                <select
                  className={inputCls}
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">بدون قسم (عام)</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField label="وصف المنتج" hint="وضح خامات وجودة المنتج وتفاصيل الاستخدام">
              <textarea
                rows={3}
                className={inputCls}
                placeholder="اكتب وصفاً مفصلاً يبرز مزايا المنتج ويجيب على أسئلة العميل..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormField>
          </div>

          {/* 2. Product Images */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              صور المنتج
            </h3>
            <p className="text-[11px] text-neutral-400">
              أضف روابط صور واضحة وذات دقة عالية للمنتج ليتمكن العميل من معاينته بوضوح.
            </p>
            <ImageUploader
              images={form.images}
              onChange={(imgs) => setForm({ ...form, images: imgs })}
            />
          </div>

          {/* 3. Variants (Sizes & Colors) */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              خيارات المنتج (المقاسات والألوان)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="المقاسات المتاحة" hint="افصل بين كل مقاس بفاصلة (مثال: S, M, L, XL أو 52, 54, 56)">
                <input
                  className={inputCls}
                  placeholder="S, M, L, XL"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                />
              </FormField>

              <FormField label="الألوان المتاحة" hint="افصل بين كل لون بفاصلة (مثال: أبيض, أسود, كحلي)">
                <input
                  className={inputCls}
                  placeholder="أبيض, بيج, كحلي"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                />
              </FormField>
            </div>
          </div>

          {/* 4. Stock & Visibility */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              حالة المخزون والعرض
            </h3>

            <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">متوفر في المخزون</p>
                <p className="text-[11px] text-neutral-400">إتاحة شراء المنتج مباشرة عبر المتجر</p>
              </div>
              <Switch
                checked={form.inStock}
                onCheckedChange={(checked) => setForm({ ...form, inStock: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">منتج مميز</p>
                <p className="text-[11px] text-neutral-400">عرض المنتج في الصفحة الرئيسية بقسم المنتجات المختارة</p>
              </div>
              <Switch
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/products">
              <button
                type="button"
                className="px-5 py-2.5 text-xs font-bold text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-xs"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEdit ? "حفظ التعديلات" : "إضافة المنتج"}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
