import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useTheme, getCardClass, getHeroHeight, getBtnRadius } from "@/context/theme-context";
import { ShoppingBag, Sparkles, ArrowLeft, ArrowRight, Tag, Flame } from "lucide-react";
import { useLanguage } from "@/context/language-context";

function ProductCard({ product, storeSlug, primaryColor }: { product: any; storeSlug: string; primaryColor: string }) {
  const { format } = useCurrency();
  const theme = useTheme();
  const { isRTL } = useLanguage();

  return (
    <Link href={`/store/${storeSlug}/products/${product.id}`}>
      <div className="group cursor-pointer relative">
        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          {/* Image Container */}
          <div className={`relative overflow-hidden bg-gray-50 ${theme.gridCols === 3 ? "h-[160px]" : "h-[210px]"}`}>
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)` }}>
                <ShoppingBag className="w-8 h-8 opacity-30" style={{ color: primaryColor }} />
              </div>
            )}

            {/* Featured Badge */}
            {product.featured && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider"
                style={{ background: primaryColor }}>
                <Sparkles className="w-2.5 h-2.5" />
                <span>مميز</span>
              </div>
            )}

            {/* Sold Out Overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  نفد المخزون
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className={`${theme.gridCols === 3 ? "p-2.5" : "p-3.5"}`}>
            <h3 className={`font-bold text-gray-900 leading-snug line-clamp-2 mb-2 ${theme.gridCols === 3 ? "text-[11px]" : "text-[13px]"}`}>
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className={`font-black ${theme.gridCols === 3 ? "text-sm" : "text-base"}`}
                style={{ color: primaryColor }}>
                {format(product.price)}
              </p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{ background: `${primaryColor}15` }}>
                <ShoppingBag className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [, params] = useRoute("/store/:storeSlug");
  const storeSlug = params?.storeSlug || "demo-store";

  const { data: store } = useGetStore(storeSlug);
  const { data: products } = useListStoreProducts(storeSlug);
  const { data: categories } = useListStoreCategories(storeSlug);

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
  const itemVar = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const sections = {
    categories: theme.showCategories && categories && categories.length > 0 && (
      <div key="categories" className="px-5 py-5">
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
          <Link href={`/store/${storeSlug}/products`}>
            <button
              className={`px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all border-2 shadow-sm ${!categoryId ? "text-white border-transparent shadow-md" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"} ${btnRadius}`}
              style={!categoryId ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, borderColor: primaryColor } : {}}
            >
              الكل
            </button>
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/store/${storeSlug}/products?categoryId=${cat.id}`}>
              <button
                className={`px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all border-2 shadow-sm ${categoryId === cat.id.toString() ? "text-white border-transparent shadow-md" : "bg-white text-gray-600 border-gray-100 hover:border-gray-200"} ${btnRadius}`}
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
      <div key="featured" className="px-5 mb-8">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full" style={{ background: primaryColor }} />
            <h2 className="text-lg font-black tracking-tight text-gray-900">
              {theme.featuredTitle || "المنتجات المميزة"}
            </h2>
          </div>
          <Link href={`/store/${storeSlug}/products`}>
            <span className="flex items-center gap-1 text-sm font-bold transition-all hover:opacity-70"
              style={{ color: primaryColor }}>
              عرض الكل
              <Arrow className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        <motion.div variants={container} initial="hidden" animate="show"
          className={`grid gap-3.5 ${theme.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {featuredProducts.map(product => (
            <motion.div variants={itemVar} key={product.id}>
              <ProductCard product={product} storeSlug={storeSlug} primaryColor={primaryColor} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    ),

    allProducts: theme.showAllProducts && (
      <div key="allProducts" className="px-5">
        {allProducts.length > 0 && (
          <>
            {/* Section Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-gray-300" />
                <h2 className="text-lg font-black tracking-tight text-gray-900">
                  {theme.latestTitle || "أحدث الإضافات"}
                </h2>
              </div>
            </div>

            <motion.div variants={container} initial="hidden" animate="show"
              className={`grid gap-3.5 ${theme.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {allProducts.map(product => (
                <motion.div variants={itemVar} key={product.id}>
                  <ProductCard product={product} storeSlug={storeSlug} primaryColor={primaryColor} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        <div className="mt-8 flex justify-center pb-4">
          <Link href={`/store/${storeSlug}/products`}>
            <button
              className={`px-10 py-3.5 border-2 font-bold text-sm transition-all hover:shadow-md ${btnRadius}`}
              style={{ borderColor: primaryColor, color: primaryColor, background: `${primaryColor}08` }}
            >
              عرض جميع المنتجات
            </button>
          </Link>
        </div>
      </div>
    )
  };

  const order = theme.sectionOrder || ["categories", "featured", "allProducts"];

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col pb-6">

        {/* ── HERO SECTION ─────────────────────────────────── */}
        <div className={`relative w-full flex items-center justify-center overflow-hidden ${heroHeightClass}`}
          style={{ background: "#0f0a1e" }}>

          {/* Background image */}
          {store?.coverImage ? (
            <img src={store.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            /* Fallback gradient */
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(140deg, ${primaryColor}cc 0%, #0f0a1e 60%)` }} />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: `rgba(10,5,25,${overlayOpacity + 0.15})` }} />

          {/* Decorative glow orbs */}
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: primaryColor }} />
          <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full opacity-15 blur-3xl"
            style={{ background: primaryColor }} />

          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px"
            }} />

          {/* Hero Content */}
          <div className="z-10 flex flex-col items-center text-center px-8">
            {/* Logo */}
            {store?.logoImage && theme.heroHeight !== "small" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="mb-5"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                    style={{ background: primaryColor }} />
                  <img
                    src={store.logoImage}
                    alt={store.name}
                    className="relative w-18 h-18 rounded-2xl object-cover border-2 border-white/20 shadow-2xl"
                    style={{ width: 72, height: 72 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Store Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="text-4xl font-black text-white tracking-tight mb-2 drop-shadow-lg"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
            >
              {theme.heroTitle || store?.name || "متجرنا"}
            </motion.h1>

            {/* Subtitle */}
            {theme.heroSubtitle && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
                className="text-white/70 text-sm mb-6 max-w-[260px] leading-relaxed"
              >
                {theme.heroSubtitle}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.5 }}
            >
              <Link href={`/store/${storeSlug}/products`}>
                <button
                  className={`group flex items-center gap-2.5 px-8 py-3 text-sm font-black uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 active:scale-95 ${btnRadius}`}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                    boxShadow: `0 4px 24px ${primaryColor}55, 0 0 0 1px ${primaryColor}40`
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {theme.heroCtaText || "تسوق الآن"}
                  <Arrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: "linear-gradient(to top, #f9f9f9, transparent)" }} />
        </div>

        {/* ── PROMO BANNER (if store has description) ─────── */}
        {store?.description && (
          <div className="mx-5 -mt-5 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}12, ${primaryColor}06)`,
                border: `1px solid ${primaryColor}20`
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${primaryColor}15` }}>
                <Tag className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-snug">{store.description}</p>
            </motion.div>
          </div>
        )}

        {/* ── DYNAMIC SECTIONS ─────────────────────────────── */}
        <div className="mt-2">
          {order.map(key => sections[key as keyof typeof sections])}
        </div>

      </div>
    </StoreLayout>
  );
}
