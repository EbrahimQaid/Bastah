import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@/services/api";
import { useState, useMemo } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  PackageX,
  ShoppingBag,
  Sparkles,
  Check,
  RotateCcw,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
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
  const { isRTL } = useLanguage();
  const { addItem, openMiniCart } = useCart();
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
    setTimeout(() => setJustAdded(false), 1600);
    openMiniCart();
    toast({
      title: isRTL ? "تمت الإضافة إلى السلة" : "Added to shopping bag",
      description: product.name,
    });
  };

  const imageSrc =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : typeof product.images === "string" && product.images
      ? product.images
      : "/images/product_luxury_thobe_1790631673826.jpg";

  return (
    <Link href={`/store/products/${product.id}`}>
      <div className="group cursor-pointer flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/70 dark:border-zinc-800/80 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-zinc-800/70 overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
              <span className="bg-white text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {isRTL ? "نفد المخزون" : "Sold Out"}
              </span>
            </div>
          )}

          {product.featured && product.inStock && (
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
              <span
                className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-1"
                style={{ background: primaryColor }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{isRTL ? "مختار" : "Curated"}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-1 gap-3">
          <div>
            <span className="text-[11px] font-medium text-neutral-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
              {product.categoryName || (isRTL ? "منتج مميز" : "Signature")}
            </span>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 block leading-tight">
                {isRTL ? "السعر" : "Price"}
              </span>
              <p className="text-base font-black font-mono tabular-nums text-neutral-900 dark:text-white">
                {format(product.price)}
              </p>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              style={{
                background: justAdded
                  ? "#16a34a"
                  : product.inStock
                  ? `${primaryColor}15`
                  : undefined,
                color: justAdded
                  ? "#ffffff"
                  : product.inStock
                  ? primaryColor
                  : undefined,
              }}
              aria-label={isRTL ? "إضافة سريعة إلى السلة" : "Quick add to bag"}
            >
              {justAdded ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>
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
    let list = products.filter((p) => {
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <Link href="/store" className="hover:text-neutral-700 dark:hover:text-zinc-200">
                {isRTL ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-neutral-900 dark:text-white font-semibold">
                {isRTL ? "جميع المنتجات" : "All Products"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isRTL ? "كتالوج المنتجات" : "Product Catalog"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                className={`absolute ${
                  isRTL ? "right-3" : "left-3"
                } top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400`}
              />
              <input
                type="text"
                className={`w-full h-10 ${
                  isRTL ? "pr-9 pl-8" : "pl-9 pr-8"
                } rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-xs font-medium text-neutral-800 dark:text-zinc-200 placeholder:text-neutral-400 outline-none focus:border-red-500 transition-colors`}
                placeholder={isRTL ? "ابحث باسم المنتج..." : "Search products..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute ${
                    isRTL ? "left-2.5" : "right-2.5"
                  } top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden h-10 px-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isRTL ? "تصفية" : "Filter"}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full" style={{ background: primaryColor }} />
              )}
            </button>
          </div>
        </div>

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
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/80 dark:border-zinc-800/80 p-8">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-400">
                  <PackageX className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {isRTL ? "لم نعثر على أي منتجات مطابقة" : "No products found"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-xs mx-auto">
                    {isRTL
                      ? "جرب إزالة بعض الفلاتر أو استخدام كلمات بحث مختلفة."
                      : "Try clearing selected filters or searching for different keywords."}
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity shadow-sm"
                  style={{ background: primaryColor }}
                >
                  {isRTL ? "إعادة تعيين الفلاتر" : "Clear All Filters"}
                </button>
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
