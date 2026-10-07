import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  X,
  Sparkles,
  Tag,
  ArrowLeft,
  ArrowRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Category } from "@/services/api";

interface SmartSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories?: Category[];
  products?: Product[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onClearSearch: () => void;
  primaryColor?: string;
  formatCurrency: (amount: number) => string;
  isRTL: boolean;
  totalResultsCount: number;
  onOpenMobileFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function SmartSearchBar({
  search,
  onSearchChange,
  categories = [],
  products = [],
  selectedCategory,
  onSelectCategory,
  onClearSearch,
  primaryColor = "#991B1B",
  formatCurrency,
  isRTL,
  totalResultsCount,
  onOpenMobileFilters,
  hasActiveFilters = false,
}: SmartSearchBarProps) {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: '/' or 'Ctrl+K' / 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const normalizedQuery = search.trim().toLowerCase();

  // Find matching categories in real time
  const matchingCategories = useMemo(() => {
    if (!normalizedQuery) return [];
    return categories.filter((cat) => cat.name.toLowerCase().includes(normalizedQuery));
  }, [categories, normalizedQuery]);

  // Find matching products in real time (titles, category names, descriptions)
  const matchingProducts = useMemo(() => {
    if (!normalizedQuery) return [];
    return products.filter((prod) => {
      const nameMatch = prod.name.toLowerCase().includes(normalizedQuery);
      const catMatch = prod.categoryName?.toLowerCase().includes(normalizedQuery);
      const descMatch = prod.description?.toLowerCase().includes(normalizedQuery);
      return nameMatch || catMatch || descMatch;
    });
  }, [products, normalizedQuery]);

  // Helper to highlight matching text query
  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark
              key={index}
              className="bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 font-bold px-0.5 rounded-xs"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleSelectProduct = (productId: number) => {
    setIsOpen(false);
    setLocation(`/store/products/${productId}`);
  };

  const handleChooseCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
    setIsOpen(false);
  };

  const activeCategoryObj = categories.find((c) => String(c.id) === selectedCategory);

  return (
    <div ref={containerRef} className="relative w-full space-y-3">
      {/* ── Main Smart Search Bar Input ── */}
      <div className="flex items-center gap-2.5">
        <div
          className={`relative flex-1 group transition-all duration-200 rounded-2xl bg-white dark:bg-zinc-900 border ${
            isOpen || search
              ? "border-neutral-400 dark:border-zinc-600 shadow-md ring-2 ring-neutral-200/50 dark:ring-zinc-800/80"
              : "border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700 shadow-xs"
          }`}
        >
          {/* Search Icon / Sparkles Badge */}
          <div
            className={`absolute ${
              isRTL ? "right-3.5" : "left-3.5"
            } top-1/2 -translate-y-1/2 flex items-center justify-center transition-colors pointer-events-none`}
          >
            {normalizedQuery ? (
              <Sparkles
                className="w-4 h-4 text-amber-500 animate-pulse"
                aria-hidden="true"
              />
            ) : (
              <Search
                className="w-4 h-4 text-neutral-400 group-focus-within:text-neutral-700 dark:group-focus-within:text-zinc-200"
                aria-hidden="true"
              />
            )}
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={
              isRTL
                ? "ابحث باسم المنتج أو التصنيف (مثال: ثوب، عطور، تراث)..."
                : "Search by product title or category (e.g., thobe, perfume)..."
            }
            className={`w-full h-12 text-xs sm:text-sm font-medium bg-transparent outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-zinc-500 ${
              isRTL ? "pr-11 pl-20 sm:pl-28" : "pl-11 pr-20 sm:pr-28"
            }`}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Action buttons inside search box: Clear & Shortcut */}
          <div
            className={`absolute ${
              isRTL ? "left-3" : "right-3"
            } top-1/2 -translate-y-1/2 flex items-center gap-1.5`}
          >
            {search && (
              <button
                type="button"
                onClick={() => {
                  onClearSearch();
                  inputRef.current?.focus();
                }}
                className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                title={isRTL ? "مسح البحث (Esc)" : "Clear search (Esc)"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Desktop shortcut hint */}
            <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-neutral-100 dark:bg-zinc-800/80 border border-neutral-200/80 dark:border-zinc-700/80 text-[10px] font-mono text-neutral-400 select-none">
              <span className="font-sans">/</span>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        {onOpenMobileFilters && (
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden h-12 px-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-bold shrink-0 hover:bg-neutral-50 dark:hover:bg-zinc-800/70 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-neutral-600 dark:text-zinc-300" />
            <span className="hidden xs:inline">{isRTL ? "تصفية" : "Filter"}</span>
            {hasActiveFilters && (
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: primaryColor }}
              />
            )}
          </button>
        )}
      </div>

      {/* ── Quick Category Suggestion Pills (Horizontally Scrollable) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
        <button
          type="button"
          onClick={() => handleChooseCategory("")}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            !selectedCategory
              ? "text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 border border-neutral-200/80 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800"
          }`}
          style={!selectedCategory ? { background: primaryColor } : undefined}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isRTL ? "كافة التصنيفات" : "All Categories"}</span>
        </button>

        {categories.map((cat) => {
          const isCategorySelected = selectedCategory === String(cat.id);
          const isCategoryMatched =
            normalizedQuery && cat.name.toLowerCase().includes(normalizedQuery);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleChooseCategory(isCategorySelected ? "" : String(cat.id))}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                isCategorySelected
                  ? "text-white font-bold shadow-xs"
                  : isCategoryMatched
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold"
                  : "bg-white dark:bg-zinc-900 text-neutral-700 dark:text-zinc-300 border border-neutral-200/80 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800"
              }`}
              style={isCategorySelected ? { background: primaryColor } : undefined}
            >
              <Tag className="w-3 h-3 opacity-70" />
              <span>{cat.name}</span>
              {isCategoryMatched && !isCategorySelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active Search Context Bar (When Query or Category Active) ── */}
      {(search || selectedCategory) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-neutral-100/80 dark:bg-zinc-800/60 border border-neutral-200/60 dark:border-zinc-700/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-500 dark:text-zinc-400 font-medium">
              {isRTL ? "نتائج البحث:" : "Search Results:"}
            </span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-white font-bold">
                <span>"{search}"</span>
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="hover:text-red-500 text-neutral-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-white font-bold">
                <Tag className="w-3 h-3 text-neutral-400" />
                <span>{activeCategoryObj.name}</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory("")}
                  className="hover:text-red-500 text-neutral-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <span className="text-neutral-400 font-mono text-[11px]">
              ({totalResultsCount} {isRTL ? "منتج" : "items"})
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClearSearch();
              onSelectCategory("");
            }}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline transition-colors shrink-0"
          >
            {isRTL ? "مسح البحث والتصنيف" : "Clear filters"}
          </button>
        </div>
      )}

      {/* ── Real-Time Live Suggestions Dropdown Panel ── */}
      <AnimatePresence>
        {isOpen && normalizedQuery && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="absolute top-14 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/90 dark:border-zinc-800 shadow-xl overflow-hidden divide-y divide-neutral-100 dark:divide-zinc-800"
          >
            {/* Matching Categories Header Section */}
            {matchingCategories.length > 0 && (
              <div className="p-3 bg-neutral-50/70 dark:bg-zinc-900/90 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{isRTL ? "تصنيفات مطابقة" : "Matching Categories"}</span>
                  </span>
                  <span className="text-[10px] font-normal">
                    {isRTL ? "اضغط للتصفية" : "Click to filter"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleChooseCategory(String(cat.id))}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-800 dark:text-zinc-200 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Tag className="w-3 h-3 text-amber-600" />
                      <span>{highlightMatch(cat.name, search)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Products Section */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-zinc-800/60">
              {matchingProducts.length > 0 ? (
                <div>
                  <div className="px-3 py-1.5 text-[11px] font-bold text-neutral-400 flex items-center justify-between">
                    <span>{isRTL ? "منتجات مطابقة" : "Matching Products"}</span>
                    <span className="font-mono text-[10px]">
                      {matchingProducts.length} {isRTL ? "نتيجة" : "results"}
                    </span>
                  </div>

                  {matchingProducts.slice(0, 5).map((prod) => {
                    const imgUrl = Array.isArray(prod.images)
                      ? prod.images[0]
                      : typeof prod.images === "string"
                      ? prod.images
                      : "/images/product_luxury_thobe_1790631673826.jpg";

                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod.id)}
                        className="w-full text-start p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-zinc-800/60 flex items-center gap-3 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-neutral-200/50 dark:border-zinc-700/50">
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {highlightMatch(prod.name, search)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prod.categoryName && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400 font-medium">
                                {highlightMatch(prod.categoryName, search)}
                              </span>
                            )}
                            <span className="text-xs font-mono font-bold text-neutral-800 dark:text-zinc-200">
                              {formatCurrency(prod.price)}
                            </span>
                          </div>
                        </div>

                        <div className="text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-zinc-200 shrink-0">
                          {isRTL ? (
                            <ChevronLeft className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center space-y-1">
                  <p className="text-xs font-bold text-neutral-800 dark:text-zinc-200">
                    {isRTL ? "لا توجد منتجات مطابقة لهذا البحث" : "No products match this query"}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {isRTL
                      ? "جرب البحث بكلمة أخرى أو اختر من التصنيفات أعلاه"
                      : "Try different keywords or browse categories"}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Footer: "View All Results" bar */}
            <div className="p-2.5 bg-neutral-50 dark:bg-zinc-950/50 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {isRTL ? "إغلاق المقترحات" : "Close suggestions"}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-white font-bold text-xs transition-opacity flex items-center gap-1.5 shadow-xs"
                style={{ background: primaryColor }}
              >
                <span>
                  {isRTL
                    ? `عرض النتائج (${matchingProducts.length})`
                    : `Show Results (${matchingProducts.length})`}
                </span>
                {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
