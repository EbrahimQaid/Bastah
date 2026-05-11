import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, SlidersHorizontal, PackageX, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";

export default function ProductList() {
  const [, params] = useRoute("/store/:storeSlug/products");
  const storeSlug = params?.storeSlug || "demo-store";
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategoryId = searchParams.get("categoryId") || "";

  const { t, isRTL } = useLanguage();
  const { format } = useCurrency();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: "",
    maxPrice: "",
  });

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

  const hasActiveFilters = appliedFilters.minPrice || appliedFilters.maxPrice;

  const clearSearch = () => setSearch("");

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
    show: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } }
  };

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col min-h-full pb-24 relative" dir={isRTL ? "rtl" : "ltr"}>
        {/* Search + Filter bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl pt-4 pb-3 px-5 border-b border-border/40">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                className={`${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} bg-surface border-transparent rounded-full h-12 text-base focus-visible:ring-primary shadow-sm`}
                placeholder={t.searchProducts}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className={`absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted p-1 rounded-full`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className="h-12 w-12 rounded-full border border-border bg-surface shrink-0 shadow-sm flex items-center justify-center relative hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {hasActiveFilters && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
              )}
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface text-foreground border-border hover:bg-surface/80'}`}
            >
              {t.shop === "Shop" ? "All" : "الكل"}
            </button>
            {categories?.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${selectedCategory === cat.id.toString() ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface text-foreground border-border hover:bg-surface/80'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count */}
        <div className="px-5 pt-5 pb-2 flex justify-between items-center">
          <h2 className="font-semibold text-muted-foreground text-sm">
            {filteredProducts?.length || 0} {t.products}
          </h2>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-xs text-primary font-semibold hover:underline">
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
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-5">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                <PackageX className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold">{t.noProductsFound}</h3>
                <p className="text-muted-foreground text-sm max-w-[220px] mx-auto">
                  {isRTL ? "لا توجد منتجات تطابق الفلاتر الحالية." : "Nothing matches your current filters."}
                </p>
              </div>
              <Button onClick={handleClearFilters} variant="outline" className="rounded-full px-8 h-11 font-semibold">
                {t.clearFilters}
              </Button>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-4"
            >
              {filteredProducts?.map(product => (
                <motion.div variants={item} key={product.id}>
                  <Link href={`/store/${storeSlug}/products/${product.id}`}>
                    <Card className="border-none bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group h-full flex flex-col">
                      <div className="h-[200px] bg-surface relative overflow-hidden">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted text-xs">No image</div>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-black text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm">{t.soldOut}</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-[12px] leading-tight text-foreground line-clamp-2 mb-2">{product.name}</h3>
                        <p className="text-[14px] text-primary font-bold">{format(product.price)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* CUSTOM FILTER BOTTOM SHEET — contained within store layout, no portal */}
        <AnimatePresence>
          {filterOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="filter-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/30 z-50"
                onClick={() => setFilterOpen(false)}
              />
              {/* Drawer */}
              <motion.div
                key="filter-drawer"
                dir={isRTL ? "rtl" : "ltr"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[51] pb-10 max-h-[80%] overflow-y-auto"
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-border rounded-full" />
                </div>

                <div className="px-6 pt-3">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">{t.filters}</h2>
                    <button onClick={() => setFilterOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3 mb-8">
                    <h3 className="font-semibold text-base">{t.priceRange}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block font-medium uppercase tracking-wider">{t.minPrice}</label>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-12 rounded-xl bg-surface border-transparent"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      <div className="w-4 h-[1px] bg-border mt-6"></div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block font-medium uppercase tracking-wider">{t.maxPrice}</label>
                        <Input
                          type="number"
                          placeholder="500"
                          className="h-12 rounded-xl bg-surface border-transparent"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      onClick={handleApplyFilters}
                      className="w-full h-13 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-white"
                    >
                      {t.apply}
                    </Button>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      className="w-full h-13 rounded-xl text-base font-bold border-border"
                    >
                      {t.clearFilters}
                    </Button>
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
