import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useTheme, getCardClass, getHeroHeight, getBtnRadius } from "@/context/theme-context";
import { ShoppingBag, Sparkles, ArrowLeft, ArrowRight, Tag, Flame, Star, Check, Truck, ShieldCheck, CreditCard, Headphones, Copy } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function ProductCard({ product, primaryColor }: { product: any; primaryColor: string }) {
  const { format } = useCurrency();
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, guide them to product page
    if (product.variants?.sizes?.length || product.variants?.colors?.length) {
      window.location.href = `/store/products/${product.id}`;
      return;
    }

    if (!product.inStock) return;

    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.images?.[0] ?? undefined,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast({
      title: "تمت الإضافة للسلة ✓",
      description: product.name,
    });
  };

  return (
    <Link href={`/store/products/${product.id}`}>
      <div className="group cursor-pointer relative h-full">
        {/* Card */}
        <div
          className="bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col h-full border border-gray-100 dark:border-slate-800"
          style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.05)" }}
        >
          {/* Image Container */}
          <div className={`relative overflow-hidden bg-gray-50 dark:bg-slate-800 ${theme.gridCols === 3 ? "h-[135px]" : "h-[160px]"}`}>
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)` }}
              >
                <ShoppingBag className="w-8 h-8 opacity-30" style={{ color: primaryColor }} />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
              {product.featured && (
                <div
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white text-[9px] font-black uppercase tracking-wider shadow-sm"
                  style={{ background: primaryColor }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{isRTL ? "مميز" : "Featured"}</span>
                </div>
              )}
            </div>

            {/* Rating pill overlay */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-gray-800 dark:text-gray-200">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>4.9</span>
            </div>

            {/* Sold Out Overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {isRTL ? "نفد المخزون" : "Sold Out"}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className={`flex flex-col justify-between flex-1 ${theme.gridCols === 3 ? "p-2.5" : "p-3.5"}`}>
            <div>
              <h3 className={`font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${theme.gridCols === 3 ? "text-[11px]" : "text-[13px]"}`}>
                {product.name}
              </h3>
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block leading-none mb-0.5">السعر</span>
                <p className={`font-black ${theme.gridCols === 3 ? "text-xs" : "text-sm sm:text-base"}`} style={{ color: primaryColor }}>
                  {format(product.price)}
                </p>
              </div>

              {/* Quick Add Button */}
              <button
                onClick={handleQuickAdd}
                disabled={!product.inStock}
                aria-label="Add to cart"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 shadow-sm"
                style={{
                  background: justAdded
                    ? "#22c55e"
                    : product.inStock
                    ? `${primaryColor}15`
                    : "#f3f4f6",
                  color: justAdded
                    ? "#ffffff"
                    : product.inStock
                    ? primaryColor
                    : "#9ca3af",
                }}
              >
                {justAdded ? (
                  <Check className="w-4 h-4 animate-bounce" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data: store } = useGetStore();
  const { data: products } = useListStoreProducts();
  const { data: categories } = useListStoreCategories();
  const { toast } = useToast();

  const theme = useTheme();
  const heroHeightClass = getHeroHeight(theme.heroHeight);
  const btnRadius = getBtnRadius(theme.buttonRadius);
  const { isRTL } = useLanguage();

  const queryParams = new URLSearchParams(window.location.search);
  const categoryId = queryParams.get("categoryId");

  const primaryColor = store?.primaryColor || "#7C3AED";
  const overlayOpacity = (theme.heroOverlayOpacity ?? 35) / 100;

  const featuredProducts = products?.filter(p => p.featured).slice(0, theme.gridCols === 3 ? 6 : 4) || [];
  const allProducts = products?.filter(p => !p.featured).slice(0, theme.gridCols === 3 ? 9 : 6) || [];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVar: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const localizedFeaturedTitle = isRTL
    ? (!theme.featuredTitle || theme.featuredTitle.toLowerCase() === "featured" ? "المنتجات المميزة" : theme.featuredTitle)
    : (theme.featuredTitle || "Featured Products");

  const localizedLatestTitle = isRTL
    ? (!theme.latestTitle || theme.latestTitle.toLowerCase().includes("latest") ? "أحدث الإضافات" : theme.latestTitle)
    : (theme.latestTitle || "Latest Arrivals");

  const localizedHeroCta = isRTL
    ? (!theme.heroCtaText || theme.heroCtaText.toLowerCase().includes("shop") ? "تسوق الآن" : theme.heroCtaText)
    : (theme.heroCtaText || "Shop Now");

  const localizedCategoriesTitle = isRTL ? "الأقسام المميزة" : "Featured Categories";
  const localizedViewAll = isRTL ? "عرض الكل" : "View All";
  const localizedAllCount = isRTL ? "الكل" : "All";
  const localizedExploreAll = isRTL ? "استعراض جميع المنتجات" : "Explore All Products";

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast({
      title: "تم نسخ كود الخصم! 🎁",
      description: `استخدم الكود ${code} عند إتمام الشراء`,
    });
  };

  const sections = {
    categories: theme.showCategories && categories && categories.length > 0 && (
      <div key="categories" className="px-5 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {localizedCategoriesTitle}
          </h2>
          <Link href="/store/products" className="text-[11px] font-bold transition-opacity hover:opacity-80" style={{ color: primaryColor }}>
            {localizedAllCount} ({categories.length})
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
          <Link href={`/store/products`}>
            <button
              className={`px-3.5 py-1.5 text-[11px] font-black whitespace-nowrap transition-all border shadow-xs ${!categoryId ? "text-white border-transparent shadow-sm scale-102" : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:border-gray-200"} ${btnRadius}`}
              style={!categoryId ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, borderColor: primaryColor } : {}}
            >
              {localizedAllCount} ({products?.length || 0})
            </button>
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/store/products?categoryId=${cat.id}`}>
              <button
                className={`px-3.5 py-1.5 text-[11px] font-black whitespace-nowrap transition-all border shadow-xs ${categoryId === cat.id.toString() ? "text-white border-transparent shadow-sm scale-102" : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:border-gray-200"} ${btnRadius}`}
                style={categoryId === cat.id.toString() ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, borderColor: primaryColor } : {}}
              >
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    ),

    featured: theme.showFeatured && featuredProducts.length > 0 && (
      <div key="featured" className="px-5 mb-5 mt-2">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full" style={{ background: primaryColor }} />
            <h2 className="text-sm sm:text-base font-black tracking-tight text-gray-900 dark:text-gray-100">
              {localizedFeaturedTitle}
            </h2>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
              {featuredProducts.length}
            </span>
          </div>
          <Link href={`/store/products`}>
            <span className="flex items-center gap-1 text-[11px] font-bold transition-all hover:opacity-70"
              style={{ color: primaryColor }}>
              {localizedViewAll}
              <Arrow className="w-3 h-3" />
            </span>
          </Link>
        </div>

        <motion.div variants={container} initial="hidden" animate="show"
          className={`grid gap-3 ${theme.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {featuredProducts.map(product => (
            <motion.div variants={itemVar} key={product.id}>
              <ProductCard product={product} primaryColor={primaryColor} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    ),

    allProducts: theme.showAllProducts && (
      <div key="allProducts" className="px-5 mb-6">
        {allProducts.length > 0 && (
          <>
            {/* Section Header */}
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-gray-400" />
                <h2 className="text-sm sm:text-base font-black tracking-tight text-gray-900 dark:text-gray-100">
                  {localizedLatestTitle}
                </h2>
              </div>
            </div>

            <motion.div variants={container} initial="hidden" animate="show"
              className={`grid gap-3 ${theme.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {allProducts.map(product => (
                <motion.div variants={itemVar} key={product.id}>
                  <ProductCard product={product} primaryColor={primaryColor} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        <div className="mt-5 flex justify-center pb-2">
          <Link href={`/store/products`}>
            <button
              className={`px-6 py-2.5 border-2 font-black text-xs transition-all hover:shadow-md active:scale-95 ${btnRadius}`}
              style={{ borderColor: primaryColor, color: primaryColor, background: `${primaryColor}0a` }}
            >
              {localizedExploreAll} ({products?.length || 0})
            </button>
          </Link>
        </div>
      </div>
    )
  };

  const order = theme.sectionOrder || ["categories", "featured", "allProducts"];

  return (
    <StoreLayout>
      <div className="flex flex-col pb-28">

        {/* ── HERO SECTION ─────────────────────────────────── */}
        <div
          className="relative w-full flex items-center justify-center overflow-hidden min-h-[145px] py-4"
          style={{ background: "#0b0716" }}
        >
          {/* Background image */}
          {store?.coverImage ? (
            <img src={store.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(140deg, ${primaryColor}cc 0%, #0b0716 75%)` }}
            />
          )}

          {/* Clean dark gradient overlay for optimal text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0716]/95 via-[#0b0716]/75 to-[#0b0716]/50" />

          {/* Subtle glow accent */}
          <div
            className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: primaryColor }}
          />

          {/* Hero Content - Crisp, focused, no clutter */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm mx-auto">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>{isRTL ? "مجموعة الموسم الجديدة 2026" : "New Season Collection 2026"}</span>
            </motion.div>

            {/* Campaign Title */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-lg sm:text-xl font-black text-white tracking-tight mb-1 leading-snug drop-shadow-md"
            >
              {theme.heroTitle && theme.heroTitle !== store?.name && theme.heroTitle.toLowerCase() !== "featured"
                ? theme.heroTitle
                : (isRTL ? "تألق بأحدث صيحات الموسم" : "Shine with the Latest Trends")}
            </motion.h1>

            {/* Short punchy subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="text-white/85 text-[11px] mb-3 max-w-[260px] leading-tight line-clamp-1"
            >
              {isRTL ? "أحدث صيحات الموضة والعطور بجودة استثنائية" : "Curated fashion & fragrances with exceptional quality"}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              <Link href="/store/products">
                <button
                  className={`group flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-black text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${btnRadius}`}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                    boxShadow: `0 3px 14px ${primaryColor}50`,
                  }}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>{localizedHeroCta}</span>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── STREAMLINED TRUST STRIP (Compact & Clean) ─────────── */}
        <div className="px-5 -mt-2.5 relative z-10">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-gray-100 dark:border-slate-800 p-2">
            <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide text-center divide-x divide-gray-100 dark:divide-slate-800 rtl:divide-x-reverse">
              <div className="flex items-center justify-center gap-1 flex-1 min-w-[70px] py-0.5 px-0.5">
                <Truck className="w-3 h-3 text-green-600 shrink-0" />
                <span className="text-[9.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">{isRTL ? "شحن سريع" : "Fast Delivery"}</span>
              </div>
              <div className="flex items-center justify-center gap-1 flex-1 min-w-[70px] py-0.5 px-0.5">
                <ShieldCheck className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="text-[9.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">{isRTL ? "أصلي 100%" : "100% Genuine"}</span>
              </div>
              <div className="flex items-center justify-center gap-1 flex-1 min-w-[70px] py-0.5 px-0.5">
                <CreditCard className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="text-[9.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">{isRTL ? "دفع عند الاستلام" : "Cash on Delivery"}</span>
              </div>
              <div className="flex items-center justify-center gap-1 flex-1 min-w-[70px] py-0.5 px-0.5">
                <Headphones className="w-3 h-3 text-purple-600 shrink-0" />
                <span className="text-[9.5px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">{isRTL ? "دعم فوري" : "24/7 Support"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SLIM COUPON CALLOUT ───────────────────────────── */}
        <div className="px-5 mt-2">
          <div
            className="rounded-lg px-2.5 py-1.5 flex items-center justify-between border"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}0c, ${primaryColor}03)`,
              borderColor: `${primaryColor}20`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-[10px] shrink-0" style={{ background: primaryColor }}>
                %
              </span>
              <span className="text-[10.5px] font-black text-gray-900 dark:text-gray-100">
                {isRTL ? "خصم 10% لطلبك الأول" : "10% Off Your First Order"}
              </span>
            </div>

            <button
              onClick={() => handleCopyCoupon("DUKKANI10")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-black border border-dashed transition-all active:scale-95 bg-white/90 dark:bg-slate-800/90 shadow-2xs"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              <span>DUKKANI10</span>
              <Copy className="w-2 h-2" />
            </button>
          </div>
        </div>

        {/* ── DYNAMIC SECTIONS ─────────────────────────────── */}
        <div className="mt-2">
          {order.map(key => sections[key as keyof typeof sections])}
        </div>

      </div>
    </StoreLayout>
  );
}

