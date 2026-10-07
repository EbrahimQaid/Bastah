import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useTheme } from "@/context/theme-context";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Check,
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";

export default function Home() {
  const { data: store } = useGetStore();
  const { data: products } = useListStoreProducts();
  const { data: categories } = useListStoreCategories();
  const { isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const primaryColor =
    store?.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const heroImage =
    store?.coverImage || "/images/hero_storefront_campaign_1790631662971.jpg";

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === "all"
      ? products || []
      : (products || []).filter(
          (p) => String(p.categoryId) === selectedCategory,
        );

  const featuredList = (products || []).filter((p) => p.featured).slice(0, 4);
  const catalogList = filteredProducts.slice(0, 8);

  return (
    <StoreLayout>
      <div className="space-y-12 lg:space-y-16">
        {/* ── 1. Hero Campaign Banner (Split Screen on Desktop) ── */}
        <section className="relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-neutral-200/80 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text & Primary Route */}
              <div className="lg:col-span-6 space-y-6 text-start">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-zinc-400">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: primaryColor }}
                  />
                  <span>
                    {isRTL
                      ? "المتجر الإلكتروني المعتمد 2026"
                      : "Official Online Flagship 2026"}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.15] text-balance">
                  {store?.description ||
                    (isRTL
                      ? "نخبة المنتجات الفاخرة بجودة استثنائية وأسرع توصيل"
                      : "Curated Luxury Goods Crafted with Exceptional Quality")}
                </h1>

                <p className="text-sm sm:text-base text-neutral-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  {isRTL
                    ? "تسوق أرقى الملابس التقليدية، العطور الشرقية الملكية، والتحف التراثية المتقنة مع ضمان الأصالة والدفع عند الاستلام."
                    : "Discover artisanal tailoring, royal oriental fragrances, and handcrafted heritage pieces with guaranteed authenticity and flexible payment on delivery."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/store/products">
                    <button
                      className="px-6 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, #DC2626)`,
                      }}
                    >
                      <span>{isRTL ? "استعراض الكتالوج الكامل" : "Explore Full Catalog"}</span>
                      <Arrow className="w-4 h-4" />
                    </button>
                  </Link>

                  <Link href="/store/about">
                    <button className="px-5 py-3.5 rounded-xl font-bold text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 transition-colors">
                      {isRTL ? "معلومات المتجر" : "About Us"}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Visual Showcase (16:9 or 4:3 Stage) */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/60 dark:border-zinc-800/60 bg-neutral-100 dark:bg-zinc-800">
                  <img
                    src={heroImage}
                    alt="Storefront Campaign"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium backdrop-blur-md bg-black/40 px-4 py-2.5 rounded-xl border border-white/20 flex items-center justify-between">
                    <span>{isRTL ? "مجموعة الموسم الحصرية" : "Seasonal Exclusive Batch"}</span>
                    <span className="font-bold opacity-90">{isRTL ? "شحن مجاني متوفر" : "Free Delivery Available"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Reassurance & Trust Pillars (4 Clean Blocks) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isRTL ? "شحن سريع ومجاني" : "Fast & Free Shipping"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                {isRTL ? "توصيل مباشر لباب منزلك مع إمكانية التتبع الفوري" : "Direct doorstep delivery with real-time tracking"}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isRTL ? "الدفع عند الاستلام" : "Cash on Delivery"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                {isRTL ? "ادفع نقداً أو عبر البطاقة بعد فحص واستلام مشترياتك" : "Pay securely upon inspecting your delivery"}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isRTL ? "أصالة وجودة 100%" : "100% Genuine Guaranteed"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                {isRTL ? "جميع المنتجات مفحوصة ومضمونة ومطابقة لأعلى المواصفات" : "Rigorous inspection ensuring authentic craftsmanship"}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isRTL ? "استبدال واسترجاع مرن" : "14-Day Returns"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed">
                {isRTL ? "إمكانية الاستبدال أو الاسترجاع بكل سهولة خلال 14 يوماً" : "Hassle-free exchanges within 14 business days"}
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. Featured Collection Grid ── */}
        {featuredList.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 block mb-1">
                  {isRTL ? "مختارات حصرية" : "Selected Highlights"}
                </span>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  {isRTL ? "أبرز المنتجات المميزة" : "Featured Collection"}
                </h2>
              </div>
              <Link href="/store/products">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                  style={{ color: primaryColor }}
                >
                  <span>{isRTL ? "عرض جميع المنتجات" : "View All"}</span>
                  <Arrow className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredList.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
              ))}
            </div>
          </section>
        )}

        {/* ── 4. Interactive Category Filter & Catalog ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-zinc-500 block mb-1">
                {isRTL ? "تسوق حسب القسم" : "Browse by Category"}
              </span>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                {isRTL ? "قائمة المنتجات المتاحة" : "Available Products"}
              </h2>
            </div>

            {/* Segmented Category Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-zinc-800/80 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900"
                }`}
              >
                {isRTL ? "جميع الأقسام" : "All Categories"} ({products?.length || 0})
              </button>

              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(String(cat.id))}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === String(cat.id)
                      ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                      : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {catalogList.map((product) => (
              <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href={
                selectedCategory && selectedCategory !== "all"
                  ? `/store/products?categoryId=${selectedCategory}`
                  : "/store/products"
              }
            >
              <button
                className="px-8 py-3.5 rounded-xl font-bold text-sm border-2 transition-all hover:shadow-md active:scale-95"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                  background: `${primaryColor}08`,
                }}
              >
                {isRTL
                  ? `استعراض كافة المنتجات (${products?.length || 0})`
                  : `Browse All Products (${products?.length || 0})`}
              </button>
            </Link>
          </div>
        </section>

        {/* ── 5. Brand Heritage & Story Spotlight ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-neutral-900 text-white overflow-hidden p-8 sm:p-12 lg:p-16 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4 text-start">
                <span className="text-xs font-mono uppercase tracking-widest text-red-400">
                  {isRTL ? "حرفية وأصالة لا تضاهى" : "Craftsmanship & Authenticity"}
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  {isRTL
                    ? "منتجات متقنة صُممت لتدوم وتعكس ذوقك الرفيع"
                    : "Enduring Quality Designed to Complement Your Lifestyle"}
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed max-w-xl">
                  {isRTL
                    ? "نحرص في دكاني على اختيار الموردين والصناع الأكثر كفاءة، لنضمن لك تجربة تسوق استثنائية تبدأ من التصفح السهل وحتى استلام طلبك بأمان وسرعة."
                    : "Every piece in our catalog is hand-selected and inspected to meet international standards. From intuitive browsing to swift delivery, we prioritize trust."}
                </p>
                <div className="pt-2">
                  <Link href="/store/products">
                    <button className="px-6 py-3 bg-white text-neutral-900 hover:bg-neutral-100 rounded-xl font-bold text-xs transition-transform active:scale-95">
                      {isRTL ? "تسوق المجموعة الآن" : "Shop Collection"}
                    </button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="/images/product_royal_oud_1790631684386.jpg"
                    alt="Craftsmanship"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
