import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories, useGetStore } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/currency-context";
import { useTheme, getCardClass, getHeroHeight, getBtnRadius } from "@/context/theme-context";
import { ShoppingBag } from "lucide-react";

function ProductCard({ product, storeSlug }: { product: { id: number; name: string; price: number; images: string[]; inStock: boolean }; storeSlug: string }) {
  const { format } = useCurrency();
  const theme = useTheme();
  const cardClass = getCardClass(theme.cardStyle);
  const btnRadius = getBtnRadius(theme.buttonRadius);

  return (
    <Link href={`/store/${storeSlug}/products/${product.id}`}>
      <div className={`bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${cardClass}`}>
        <div className={`relative overflow-hidden bg-gray-100 ${theme.gridCols === 3 ? "h-[150px]" : "h-[200px]"}`}>
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-black text-[10px] font-black px-3 py-1 uppercase tracking-wider rounded-sm">Sold Out</span>
            </div>
          )}
        </div>
        <div className={`${theme.gridCols === 3 ? "p-2.5" : "p-3.5"} space-y-1.5`}>
          <h3 className={`font-bold text-gray-900 leading-tight line-clamp-2 ${theme.gridCols === 3 ? "text-[11px]" : "text-[13px]"}`}>{product.name}</h3>
          <p className={`font-black text-primary ${theme.gridCols === 3 ? "text-sm" : "text-[15px]"}`}>{format(product.price)}</p>
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

  const queryParams = new URLSearchParams(window.location.search);
  const categoryId = queryParams.get("categoryId");

  const primaryColor = store?.primaryColor || "#C1121F";
  const overlayOpacity = (theme.heroOverlayOpacity ?? 40) / 100;

  const featuredProducts = products?.filter(p => p.featured).slice(0, theme.gridCols === 3 ? 6 : 4) || [];
  const allProducts = products?.filter(p => !p.featured).slice(0, theme.gridCols === 3 ? 9 : 6) || [];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const itemVar = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col pb-6">

        {/* Hero */}
        <div className={`relative w-full flex items-center justify-center overflow-hidden bg-gray-900 ${heroHeightClass}`}>
          {store?.coverImage ? (
            <img src={store.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}88)` }} />
          )}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />

          {/* Decorative glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: primaryColor }} />
          </div>

          <div className="z-10 flex flex-col items-center text-center px-6">
            {store?.logoImage && theme.heroHeight !== "small" && (
              <img src={store.logoImage} alt={store.name} className="w-16 h-16 rounded-2xl object-cover shadow-xl mb-4 border-2 border-white/20" />
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-serif font-black text-white tracking-wide mb-2 drop-shadow-lg"
            >
              {theme.heroTitle || store?.name || "Welcome"}
            </motion.h1>
            {theme.heroSubtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-white/80 text-sm mb-4 max-w-xs"
              >
                {theme.heroSubtitle}
              </motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
              <Link href={`/store/${storeSlug}/products`}>
                <button
                  className={`px-7 py-2.5 text-sm font-black uppercase tracking-widest text-white border-2 border-white/70 hover:bg-white hover:text-gray-900 transition-all ${btnRadius}`}
                >
                  {theme.heroCtaText || "Shop Now"}
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Category Chips */}
        {theme.showCategories && categories && categories.length > 0 && (
          <div className="px-5 py-5">
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
              <Link href={`/store/${storeSlug}/products`}>
                <button className={`px-5 py-2 text-sm font-bold whitespace-nowrap transition-all border-2 ${!categoryId ? "text-white border-primary" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"} ${btnRadius}`}
                  style={!categoryId ? { background: primaryColor, borderColor: primaryColor } : {}}>
                  All
                </button>
              </Link>
              {categories.map(cat => (
                <Link key={cat.id} href={`/store/${storeSlug}/products?categoryId=${cat.id}`}>
                  <button
                    className={`px-5 py-2 text-sm font-bold whitespace-nowrap transition-all border-2 ${categoryId === cat.id.toString() ? "text-white" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"} ${btnRadius}`}
                    style={categoryId === cat.id.toString() ? { background: primaryColor, borderColor: primaryColor } : {}}
                  >
                    {cat.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {theme.showFeatured && featuredProducts.length > 0 && (
          <div className="px-5 mb-8">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-black tracking-tight text-gray-900">{theme.featuredTitle || "Featured"}</h2>
              <Link href={`/store/${storeSlug}/products`}>
                <span className="text-sm font-bold" style={{ color: primaryColor }}>View All →</span>
              </Link>
            </div>
            <motion.div variants={container} initial="hidden" animate="show"
              className={`grid gap-3 ${theme.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {featuredProducts.map(product => (
                <motion.div variants={itemVar} key={product.id}>
                  <ProductCard product={product} storeSlug={storeSlug} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* All Products */}
        {theme.showAllProducts && (
          <div className="px-5">
            {allProducts.length > 0 && (
              <>
                <h2 className="text-xl font-black tracking-tight text-gray-900 mb-4">{theme.latestTitle || "Latest Arrivals"}</h2>
                <motion.div variants={container} initial="hidden" animate="show"
                  className={`grid gap-3 ${theme.gridCols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {allProducts.map(product => (
                    <motion.div variants={itemVar} key={product.id}>
                      <ProductCard product={product} storeSlug={storeSlug} />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            <div className="mt-7 flex justify-center">
              <Link href={`/store/${storeSlug}/products`}>
                <button className={`px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-300 transition-all ${btnRadius}`}>
                  View All Products
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </StoreLayout>
  );
}
