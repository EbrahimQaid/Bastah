import { useRoute, Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, PackageX } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ProductList() {
  const [, params] = useRoute("/store/:storeSlug/products");
  const storeSlug = params?.storeSlug || "demo-store";
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategoryId = searchParams.get("categoryId") || "";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  
  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: "",
    maxPrice: "",
  });

  const { data: categories } = useListStoreCategories(storeSlug);
  
  const { data: products, isLoading } = useListStoreProducts(storeSlug, { 
    params: { 
      search: debouncedSearch || undefined,
      categoryId: selectedCategory ? Number(selectedCategory) : undefined,
      // Pass pricing filters if backend supports it. Assuming they do or will filter client side.
      // API spec for listStoreProductsParams only mentions storeSlug, search, categoryId, etc.
      // If it doesn't support minPrice/maxPrice, we'll just filter client side for now.
    } 
  });

  // Client side filtering for price if API doesn't support it directly
  const filteredProducts = products?.filter(p => {
    if (appliedFilters.minPrice && p.price < Number(appliedFilters.minPrice)) return false;
    if (appliedFilters.maxPrice && p.price > Number(appliedFilters.maxPrice)) return false;
    return true;
  });

  const clearSearch = () => setSearch("");
  
  const handleApplyFilters = () => {
    setAppliedFilters({ minPrice, maxPrice });
  };
  
  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedFilters({ minPrice: "", maxPrice: "" });
    setSelectedCategory("");
    setSearch("");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col min-h-full pb-10">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl pt-4 pb-3 px-5 border-b border-border/40">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-10 pr-10 bg-surface border-transparent rounded-full h-12 text-base focus-visible:ring-primary shadow-sm" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted p-1 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-border bg-surface shrink-0 shadow-sm relative">
                  <SlidersHorizontal className="w-5 h-5" />
                  {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background"></span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl px-6 pt-6 pb-12 max-h-[85vh] overflow-y-auto">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Price Range</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Min ($)</label>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="h-12 rounded-xl bg-surface border-transparent"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </div>
                      <div className="w-4 h-[1px] bg-border mt-5"></div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Max ($)</label>
                        <Input 
                          type="number" 
                          placeholder="200" 
                          className="h-12 rounded-xl bg-surface border-transparent"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <SheetFooter className="mt-10 flex-col sm:flex-col gap-3">
                  <SheetTrigger asChild>
                    <Button onClick={handleApplyFilters} className="w-full h-14 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-white">
                      Show Results
                    </Button>
                  </SheetTrigger>
                  <SheetTrigger asChild>
                    <Button onClick={handleClearFilters} variant="outline" className="w-full h-14 rounded-xl text-base font-bold border-border">
                      Clear All
                    </Button>
                  </SheetTrigger>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
            <button 
              onClick={() => setSelectedCategory("")}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface text-foreground border-border hover:bg-surface/80'}`}
            >
              All
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

        <div className="px-5 pt-6 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-muted-foreground">{filteredProducts?.length || 0} Products</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-[200px] md:h-[260px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                <PackageX className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">No products found</h3>
                <p className="text-muted-foreground max-w-[250px] mx-auto">We couldn't find anything matching your current filters.</p>
              </div>
              <Button onClick={handleClearFilters} variant="outline" className="rounded-full px-8 h-12 font-semibold">
                Clear Filters
              </Button>
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              {filteredProducts?.map(product => (
                <motion.div variants={item} key={product.id}>
                  <Link href={`/store/${storeSlug}/products/${product.id}`}>
                    <Card className="border-none bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group h-full flex flex-col">
                      <div className="h-[200px] md:h-[260px] bg-surface relative overflow-hidden">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">No image</div>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-black text-xs font-bold px-3 py-1.5 uppercase tracking-wider rounded-sm">Sold Out</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-[13px] leading-tight text-foreground line-clamp-2 mb-2">{product.name}</h3>
                        <div className="mt-auto">
                          <p className="text-[15px] text-primary font-bold">${product.price.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
