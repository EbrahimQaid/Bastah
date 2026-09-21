import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal, PackageX, ShoppingBag, Sparkles, Star, Check, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

function ProductCard({
  product,
  primaryColor,
}: {
  product: any;
  primaryColor: string;
}) {
  const { format } = useCurrency();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      <div className="group cursor-pointer h-full">
        <div
          className="bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col h-full border border-gray-100 dark:border-slate-800"
          style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.05)" }}
        >
          {/* Image */}
          <div className="h-[190px] relative overflow-hidden bg-gray-50 dark:bg-slate-800">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                loading="lazy"
                className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700 ease-out"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)` }}
              >
                <ShoppingBag className="w-8 h-8 opacity-25" style={{ color: primaryColor }} />
              </div>
            )}

            {/* Featured badge */}
            {product.featured && (
              <div
                className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-white text-[9px] font-black uppercase tracking-wider shadow-sm"
                style={{ background: primaryColor }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>مميز</span>
              </div>
            )}

            {/* Rating pill */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-gray-800 dark:text-gray-200">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>4.9</span>
            </div>

            {/* Sold Out */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  نفد المخزون
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3.5 flex flex-col justify-between flex-1">
            <h3 className="font-bold text-[13px] text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between pt-1 border-t border-gray-50 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-gray-400 font-medium block leading-none mb-0.5">السعر</span>
                <p className="text-sm sm:text-base font-black" style={{ color: primaryColor }}>
                  {format(product.price)}
                </p>
              </div>

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

export default function ProductList() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategoryId = searchParams.get("categoryId") || "";

  const { t, isRTL } = useLanguage();
  const { format, activeCurrency } = useCurrency();

  const { data: store } = useGetStore();
  const primaryColor =
    store?.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: "", maxPrice: "" });

  const { data: categories } = useListStoreCategories();
  const { data: products, isLoading } = useListStoreProducts(undefined, {
    search: debouncedSearch || undefined,
    categoryId: selectedCategory ? Number(selectedCategory) : undefined,
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let list = products.filter(p => {
      if (appliedFilters.minPrice && p.price < Number(appliedFilters.minPrice)) return false;
      if (appliedFilters.maxPrice && p.price > Number(appliedFilters.maxPrice)) return false;
      return true;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, appliedFilters, sortBy]);

  const hasActiveFilters = appliedFilters.minPrice || appliedFilters.maxPrice || selectedCategory || sortBy !== "default";

  const handleApplyFilters = () => {
    setAppliedFilters({ minPrice, maxPrice });
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedFilters({ minPrice: "", maxPrice: "" });
    setSelectedCategory("");
    setSortBy("default");
    setSearch("");
    setFilterOpen(false);
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <StoreLayout>
      <div className="flex flex-col min-h-full pb-24 relative" dir={isRTL ? "rtl" : "ltr"}>

        {/* ── Search + Filter Bar ─────────────────────── */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl pt-3.5 pb-3 px-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex gap-2.5 mb-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`}
              />
              <input
                type="text"
                className={`w-full h-11 ${isRTL ? "pr-10 pl-9" : "pl-10 pr-9"} rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-sm font-medium text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none focus:border-red-400 dark:focus:border-red-500 transition-all`}
                placeholder={t.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="h-11 px-3 rounded-2xl shrink-0 flex items-center gap-1.5 text-xs font-bold relative transition-all active:scale-95 shadow-sm"
              style={{
                background: hasActiveFilters ? `${primaryColor}15` : "#f3f4f6",
                color: hasActiveFilters ? primaryColor : "#4b5563",
                border: hasActiveFilters ? `1.5px solid ${primaryColor}40` : "1.5px solid transparent",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{isRTL ? "تصفية" : "Filter"}</span>
              {hasActiveFilters && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: primaryColor }}
                />
              )}
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-5 px-5">
            <button
              onClick={() => setSelectedCategory("")}
              className="px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border shrink-0"
              style={
                !selectedCategory
                  ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, color: "#fff", borderColor: "transparent", boxShadow: `0 3px 10px ${primaryColor}30` }
                  : { background: "#f3f4f6", color: "#4b5563", borderColor: "transparent" }
              }
            >
              الكل ({products?.length || 0})
            </button>
            {categories?.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className="px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all border shrink-0"
                style={
                  selectedCategory === cat.id.toString()
                    ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, color: "#fff", borderColor: "transparent", boxShadow: `0 3px 10px ${primaryColor}30` }
                    : { background: "#f3f4f6", color: "#4b5563", borderColor: "transparent" }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count + Sort Pills */}
        <div className="px-5 pt-3 pb-2 flex justify-between items-center text-xs">
          <p className="font-bold text-gray-500 dark:text-gray-400">
            {filteredProducts?.length || 0} {t.products}
          </p>

          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setSortBy("default")}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                sortBy === "default"
                  ? "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {isRTL ? "الافتراضي" : "Default"}
            </button>
            <button
              onClick={() => setSortBy("price-asc")}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                sortBy === "price-asc"
                  ? "bg-white dark:bg-slate-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              style={sortBy === "price-asc" ? { color: primaryColor } : {}}
            >
              {isRTL ? "الأقل سعراً" : "Price: Low"}
            </button>
            <button
              onClick={() => setSortBy("price-desc")}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                sortBy === "price-desc"
                  ? "bg-white dark:bg-slate-900 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              style={sortBy === "price-desc" ? { color: primaryColor } : {}}
            >
              {isRTL ? "الأعلى سعراً" : "Price: High"}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-5 flex-1 flex flex-col pt-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-[190px] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-5 w-1/4 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center shadow-inner"
                style={{ background: `${primaryColor}12` }}
              >
                <PackageX className="w-8 h-8" style={{ color: primaryColor, opacity: 0.6 }} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100">{t.noProductsFound}</h3>
                <p className="text-gray-400 text-xs max-w-[220px] mx-auto leading-relaxed">
                  {isRTL ? "لا توجد منتجات تطابق الفلاتر الحالية." : "Nothing matches your current filters."}
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                style={{ background: `${primaryColor}15`, color: primaryColor, border: `1px solid ${primaryColor}30` }}
              >
                {t.clearFilters}
              </button>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3.5">
              {filteredProducts?.map(product => (
                <motion.div variants={item} key={product.id}>
                  <ProductCard product={product} primaryColor={primaryColor} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Filter Bottom Sheet */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
                onClick={() => setFilterOpen(false)}
              />
              <motion.div
                key="drawer"
                dir={isRTL ? "rtl" : "ltr"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl z-[51] pb-8 max-h-[85%] overflow-y-auto border-t border-gray-100 dark:border-slate-800"
                style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full" />
                </div>

                <div className="px-6 pt-2">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">{t.filters}</h2>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t.priceRange} ({activeCurrency.symbol})</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-wider">{t.minPrice}</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-sm font-semibold outline-none focus:border-red-400 transition-colors"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      <div className="w-4 h-[2px] bg-gray-200 dark:bg-slate-700 mt-4 shrink-0" />
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 mb-1 block font-bold uppercase tracking-wider">{t.maxPrice}</label>
                        <input
                          type="number"
                          placeholder="500"
                          className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-sm font-semibold outline-none focus:border-red-400 transition-colors"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={handleApplyFilters}
                      className="w-full h-12 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                      }}
                    >
                      {t.apply}
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="w-full h-11 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 transition-all active:scale-[0.98]"
                    >
                      {t.clearFilters}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </StoreLayout>
  );
}

