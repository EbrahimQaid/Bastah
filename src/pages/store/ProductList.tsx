import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { useState } from "react";
import { Search, X, SlidersHorizontal, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { ShoppingBag, Sparkles } from "lucide-react";

function ProductCard({
  product,
  storeSlug,
  primaryColor,
}: {
  product: any;
  storeSlug: string;
  primaryColor: string;
}) {
  const { format } = useCurrency();

  return (
    <Link href={`/store/${storeSlug}/products/${product.id}`}>
      <div className="group cursor-pointer">
        <div
          className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {/* Image */}
          <div className="h-[200px] relative overflow-hidden bg-gray-50">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
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
                className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-white text-[9px] font-black uppercase tracking-wider"
                style={{ background: primaryColor }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>مميز</span>
              </div>
            )}

            {/* Sold Out */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  نفد المخزون
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3.5">
            <h3 className="font-bold text-[13px] text-gray-900 leading-snug line-clamp-2 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-base font-black" style={{ color: primaryColor }}>
                {format(product.price)}
              </p>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                style={{ background: `${primaryColor}15` }}
              >
                <ShoppingBag className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductList() {
  const [, params] = useRoute("/store/:storeSlug/products");
  const storeSlug = params?.storeSlug || "demo-store";
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategoryId = searchParams.get("categoryId") || "";

  const { t, isRTL } = useLanguage();
  const { format } = useCurrency();

  const { data: store } = useGetStore(storeSlug);
  const primaryColor = store?.primaryColor || "#7C3AED";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: "", maxPrice: "" });

  const { data: categories } = useListStoreCategories(storeSlug);
  const { data: products, isLoading } = useListStoreProducts(storeSlug, {
    search: debouncedSearch || undefined,
    categoryId: selectedCategory ? Number(selectedCategory) : undefined,
  });

  const filteredProducts = products?.filter(p => {
    if (appliedFilters.minPrice && p.price < Number(appliedFilters.minPrice)) return false;
    if (appliedFilters.maxPrice && p.price > Number(appliedFilters.maxPrice)) return false;
    return true;
  });

  const hasActiveFilters = appliedFilters.minPrice || appliedFilters.maxPrice || selectedCategory;

  const handleApplyFilters = () => {
    setAppliedFilters({ minPrice, maxPrice });
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedFilters({ minPrice: "", maxPrice: "" });
    setSelectedCategory("");
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
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col min-h-full pb-24 relative" dir={isRTL ? "rtl" : "ltr"}>

        {/* ── Search + Filter Bar ─────────────────────── */}
        <div className="sticky top-0 z-40 bg-white/96 backdrop-blur-xl pt-4 pb-3.5 px-5 border-b border-gray-100">
          <div className="flex gap-3 mb-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`}
              />
              <input
                type="text"
                className={`w-full h-12 ${isRTL ? "pr-11 pl-10" : "pl-11 pr-10"} rounded-2xl bg-gray-50 border border-gray-100 text-sm font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:bg-white transition-all`}
                placeholder={t.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center relative transition-all hover:scale-105 active:scale-95"
              style={{
                background: hasActiveFilters ? `${primaryColor}12` : "#f3f4f6",
                border: hasActiveFilters ? `1.5px solid ${primaryColor}40` : "1.5px solid transparent",
              }}
            >
              <SlidersHorizontal
                className="w-5 h-5"
                style={{ color: hasActiveFilters ? primaryColor : "#6b7280" }}
              />
              {hasActiveFilters && (
                <span
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: primaryColor }}
                />
              )}
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-0.5 -mx-5 px-5">
            <button
              onClick={() => setSelectedCategory("")}
              className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 shrink-0"
              style={
                !selectedCategory
                  ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, color: "#fff", borderColor: "transparent", boxShadow: `0 4px 12px ${primaryColor}35` }
                  : { background: "#f3f4f6", color: "#374151", borderColor: "transparent" }
              }
            >
              الكل
            </button>
            {categories?.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className="px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 shrink-0"
                style={
                  selectedCategory === cat.id.toString()
                    ? { background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, color: "#fff", borderColor: "transparent", boxShadow: `0 4px 12px ${primaryColor}35` }
                    : { background: "#f3f4f6", color: "#374151", borderColor: "transparent" }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count */}
        <div className="px-5 pt-5 pb-2 flex justify-between items-center">
          <p className="text-sm font-semibold text-gray-400">
            {filteredProducts?.length || 0} {t.products}
          </p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: primaryColor }}>
              {t.clearFilters}
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="px-5 flex-1 flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-[200px] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-5 w-1/4 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${primaryColor}10` }}
              >
                <PackageX className="w-9 h-9" style={{ color: primaryColor, opacity: 0.5 }} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-gray-900">{t.noProductsFound}</h3>
                <p className="text-gray-400 text-sm max-w-[220px] mx-auto">
                  {isRTL ? "لا توجد منتجات تطابق الفلاتر الحالية." : "Nothing matches your current filters."}
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-8 py-3 rounded-full text-sm font-bold transition-all"
                style={{ background: `${primaryColor}12`, color: primaryColor, border: `1.5px solid ${primaryColor}30` }}
              >
                {t.clearFilters}
              </button>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
              {filteredProducts?.map(product => (
                <motion.div variants={item} key={product.id}>
                  <ProductCard product={product} storeSlug={storeSlug} primaryColor={primaryColor} />
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
                className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={() => setFilterOpen(false)}
              />
              <motion.div
                key="drawer"
                dir={isRTL ? "rtl" : "ltr"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[51] pb-10 max-h-[80%] overflow-y-auto"
                style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                <div className="px-6 pt-3">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-900">{t.filters}</h2>
                    <button
                      onClick={() => setFilterOpen(false)}
                      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-base text-gray-900">{t.priceRange}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1.5 block font-bold uppercase tracking-wider">{t.minPrice}</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold outline-none focus:border-gray-300 transition-colors"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      <div className="w-5 h-[2px] bg-gray-200 mt-5 shrink-0" />
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1.5 block font-bold uppercase tracking-wider">{t.maxPrice}</label>
                        <input
                          type="number"
                          placeholder="500"
                          className="w-full h-12 px-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-semibold outline-none focus:border-gray-300 transition-colors"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleApplyFilters}
                      className="w-full h-13 rounded-2xl text-base font-black text-white transition-all active:scale-[0.98]"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                        boxShadow: `0 4px 20px ${primaryColor}40`,
                        height: 52,
                      }}
                    >
                      {t.apply}
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="w-full h-13 rounded-2xl text-base font-bold text-gray-600 bg-gray-100 transition-all active:scale-[0.98]"
                      style={{ height: 52 }}
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
