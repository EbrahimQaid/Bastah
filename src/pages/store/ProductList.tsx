import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  PackageX,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { ProductCard } from "@/components/store/ProductCard";
import { SmartSearchBar } from "@/components/store/SmartSearchBar";

export default function ProductList() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getInitialParams = () => {
    if (typeof window === "undefined") return { category: "", q: "", focus: false };
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get("categoryId") || params.get("category") || "",
      q: params.get("q") || "",
      focus: params.get("focus") === "search",
    };
  };

  const initialParams = getInitialParams();

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

  const [search, setSearch] = useState<string>(initialParams.q);
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.category);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: "", maxPrice: "" });

  // Autofocus search input when focus=search is in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("focus") === "search" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Synchronize debounced search with URL ?q=... (using replaceState to avoid history stack explosion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    const urlQ = currentParams.get("q") || "";

    if (debouncedSearch) {
      if (urlQ !== debouncedSearch) {
        currentParams.set("q", debouncedSearch);
        currentParams.delete("focus");
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
      }
    } else {
      if (currentParams.has("q") || currentParams.has("focus")) {
        currentParams.delete("q");
        currentParams.delete("focus");
        const newQuery = currentParams.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [debouncedSearch]);

  // Synchronize category selection with URL ?categoryId=...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentParams = new URLSearchParams(window.location.search);
    const urlCat = currentParams.get("categoryId") || currentParams.get("category") || "";

    if (selectedCategory) {
      if (urlCat !== selectedCategory) {
        currentParams.set("categoryId", selectedCategory);
        currentParams.delete("category");
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
      }
    } else {
      if (currentParams.has("categoryId") || currentParams.has("category")) {
        currentParams.delete("categoryId");
        currentParams.delete("category");
        const newQuery = currentParams.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
    }
  }, [selectedCategory]);

  // Restore search and category state on browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get("q") || "");
      setSelectedCategory(params.get("categoryId") || params.get("category") || "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const { data: categories } = useListStoreCategories();
  const { data: allProducts } = useListStoreProducts();
  const { data: products, isLoading } = useListStoreProducts(undefined, {
    search: debouncedSearch || undefined,
    categoryId: selectedCategory ? Number(selectedCategory) : undefined,
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const query = search.trim().toLowerCase();

    let list = products.filter((p) => {
      if (appliedFilters.minPrice && p.price < Number(appliedFilters.minPrice)) return false;
      if (appliedFilters.maxPrice && p.price > Number(appliedFilters.maxPrice)) return false;

      // Real-time instant search across product titles, category names, and descriptions
      if (query) {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const catMatch = p.categoryName?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        if (!nameMatch && !catMatch && !descMatch) return false;
      }

      return true;
    });

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, appliedFilters, sortBy, search]);

  const hasActiveFilters =
    appliedFilters.minPrice ||
    appliedFilters.maxPrice ||
    selectedCategory ||
    sortBy !== "default" ||
    search;

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

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title & Breadcrumb */}
        <div className="pb-4 border-b border-neutral-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <Link href="/store" className="hover:text-neutral-700 dark:hover:text-zinc-200">
              {isRTL ? "الرئيسية" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-semibold">
              {isRTL ? "جميع المنتجات" : "All Products"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isRTL ? "كتالوج المنتجات" : "Product Catalog"}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400">
              {isRTL
                ? "ابحث وتصفح أرقى المنتجات بحسب الاسم والتصنيف والمواصفات"
                : "Discover authentic products by title, category, and tags"}
            </p>
          </div>
        </div>

        {/* ── Smart Real-Time Search & Category Discovery Bar ── */}
        <SmartSearchBar
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          products={allProducts || products || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onClearSearch={() => setSearch("")}
          primaryColor={primaryColor}
          formatCurrency={format}
          isRTL={isRTL}
          totalResultsCount={filteredProducts.length}
          onOpenMobileFilters={() => setFilterOpen(true)}
          hasActiveFilters={Boolean(hasActiveFilters)}
        />

        {/* ── Main Layout: Sidebar Filters + Products Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                {isRTL ? "تصفية المنتجات" : "Filter Products"}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isRTL ? "إعادة تعيين" : "Reset"}</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block">
                {isRTL ? "الأقسام" : "Categories"}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-start px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? "bg-neutral-100 dark:bg-zinc-800 text-neutral-900 dark:text-white font-bold"
                      : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  {isRTL ? "جميع الأقسام" : "All Categories"} ({products?.length || 0})
                </button>

                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`w-full text-start px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === String(cat.id)
                        ? "bg-neutral-100 dark:bg-zinc-800 text-neutral-900 dark:text-white font-bold"
                        : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block">
                {isRTL ? "نطاق السعر" : "Price Range"} ({activeCurrency.symbol})
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">
                    {isRTL ? "من" : "Min"}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">
                    {isRTL ? "إلى" : "Max"}
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-xs font-mono outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyFilters}
                className="w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-xs"
                style={{ background: primaryColor }}
              >
                {isRTL ? "تطبيق السعر" : "Apply Range"}
              </button>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-9 space-y-4">
            {/* Sort Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 text-xs">
              <span className="font-semibold text-neutral-500 dark:text-zinc-400">
                {filteredProducts?.length || 0} {isRTL ? "منتج معروض" : "products"}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px] hidden sm:inline">
                  {isRTL ? "الترتيب:" : "Sort:"}
                </span>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-zinc-800 p-1 rounded-lg">
                  <button
                    onClick={() => setSortBy("default")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      sortBy === "default"
                        ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                        : "text-neutral-600 dark:text-zinc-400"
                    }`}
                  >
                    {isRTL ? "الافتراضي" : "Default"}
                  </button>
                  <button
                    onClick={() => setSortBy("price-asc")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      sortBy === "price-asc"
                        ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                        : "text-neutral-600 dark:text-zinc-400"
                    }`}
                  >
                    {isRTL ? "الأقل سعراً" : "Lowest Price"}
                  </button>
                  <button
                    onClick={() => setSortBy("price-desc")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      sortBy === "price-desc"
                        ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                        : "text-neutral-600 dark:text-zinc-400"
                    }`}
                  >
                    {isRTL ? "الأعلى سعراً" : "Highest Price"}
                  </button>
                </div>
              </div>
            </div>

            {/* Products List */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-1/3 rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/80 dark:border-zinc-800/80 p-8">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-400">
                  <PackageX className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {search
                      ? isRTL
                        ? `لم نعثر على نتائج مطابقة لـ "${search}"`
                        : `No products matching "${search}"`
                      : isRTL
                      ? "لم نعثر على أي منتجات مطابقة"
                      : "No products found"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-sm mx-auto">
                    {search
                      ? isRTL
                        ? "جرب البحث باسم منتج أو تصنيف آخر، أو استكشف الأقسام المقترحة أدناه."
                        : "Try searching by another title or category, or browse suggestions below."
                      : isRTL
                      ? "جرب إزالة بعض الفلاتر أو استخدام نطاق سعري مختلف."
                      : "Try clearing selected filters or expanding your price range."}
                  </p>
                </div>

                {categories && categories.length > 0 && search && (
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-md">
                    <span className="text-[11px] text-neutral-400 block w-full mb-1">
                      {isRTL ? "أقسام مقترحة للتصفح:" : "Suggested categories:"}
                    </span>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(String(cat.id));
                          setSearch("");
                        }}
                        className="px-3 py-1 rounded-xl text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 transition-colors font-medium"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 transition-colors"
                    >
                      {isRTL ? "مسح نص البحث" : "Clear Search"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity shadow-sm"
                    style={{ background: primaryColor }}
                  >
                    {isRTL ? "إعادة تعيين كافة الفلاتر" : "Reset All Filters"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} primaryColor={primaryColor} />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filter Drawer / Bottom Sheet */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
                onClick={() => setFilterOpen(false)}
              />
              <motion.div
                key="drawer"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-zinc-900 rounded-t-3xl z-50 p-6 overflow-y-auto lg:hidden space-y-6"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-zinc-800">
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    {isRTL ? "تصفية المنتجات" : "Filter Products"}
                  </h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block">
                    {isRTL ? "الأقسام" : "Categories"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        !selectedCategory
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300"
                      }`}
                    >
                      {isRTL ? "الكل" : "All"}
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(String(cat.id))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          selectedCategory === String(cat.id)
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                            : "bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block">
                    {isRTL ? "نطاق السعر" : "Price Range"} ({activeCurrency.symbol})
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder={isRTL ? "الحد الأدنى" : "Min"}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-neutral-100 dark:bg-zinc-800 text-xs font-mono outline-none"
                    />
                    <input
                      type="number"
                      placeholder={isRTL ? "الحد الأقصى" : "Max"}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-neutral-100 dark:bg-zinc-800 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="w-full h-12 rounded-xl text-xs font-bold text-white shadow-md"
                    style={{ background: primaryColor }}
                  >
                    {isRTL ? "تطبيق الفلاتر" : "Apply Filters"}
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="w-full h-11 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400"
                  >
                    {isRTL ? "مسح التحديد" : "Clear All"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </StoreLayout>
  );
}
