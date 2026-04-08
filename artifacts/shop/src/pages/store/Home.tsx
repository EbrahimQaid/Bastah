import { useRoute, Link, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const [, params] = useRoute("/store/:storeSlug");
  const storeSlug = params?.storeSlug || "demo-store";
  const [location] = useLocation();

  const { data: store } = useGetStore(storeSlug);
  const { data: products } = useListStoreProducts(storeSlug);
  const { data: categories } = useListStoreCategories(storeSlug);

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

  // Determine selected category id from query param just in case, though home page might just have chips as links.
  const queryParams = new URLSearchParams(window.location.search);
  const categoryId = queryParams.get("categoryId");

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col pb-8">
        {/* Premium Hero */}
        <div className="h-[220px] relative w-full flex items-center justify-center overflow-hidden bg-zinc-900">
          {store?.coverImage ? (
            <img src={store.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-zinc-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="z-10 flex flex-col items-center text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-wide mb-3 drop-shadow-md">
              {store?.name || "Welcome"}
            </h1>
            <Link href={`/store/${storeSlug}/products`} className="text-white/90 hover:text-white uppercase tracking-widest text-xs font-semibold border-b border-white/40 pb-1 hover:border-white transition-colors">
              Shop Now
            </Link>
          </div>
        </div>

        {/* Category Chips */}
        <div className="px-5 py-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            <Link href={`/store/${storeSlug}/products`}>
              <div className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-all border ${!categoryId ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface text-foreground border-border hover:bg-surface/80'}`}>
                All
              </div>
            </Link>
            {categories?.map(cat => (
              <Link key={cat.id} href={`/store/${storeSlug}/products?categoryId=${cat.id}`}>
                <div className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer transition-all border ${categoryId === cat.id.toString() ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface text-foreground border-border hover:bg-surface/80'}`}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-5 mb-8">
          <div className="flex justify-between items-end mb-5">
            <h2 className="text-xl font-bold tracking-tight">Featured</h2>
            <Link href={`/store/${storeSlug}/products`} className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 md:gap-6"
          >
            {products?.filter(p => p.featured).slice(0, 4).map(product => (
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
                      <p className="text-[15px] text-primary font-bold">${product.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* All Products Preview */}
        <div className="px-5">
          <h2 className="text-xl font-bold tracking-tight mb-5">Latest Arrivals</h2>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {products?.filter(p => !p.featured).slice(0, 6).map(product => (
              <Link key={product.id} href={`/store/${storeSlug}/products/${product.id}`}>
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
                    <p className="text-[15px] text-primary font-bold">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center pb-6">
            <Link href={`/store/${storeSlug}/products`} className="px-8 py-3.5 bg-surface text-foreground font-semibold rounded-full border border-border hover:bg-muted transition-colors shadow-sm">
              View All Products
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
