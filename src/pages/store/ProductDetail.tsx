import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStoreProduct, useGetStore } from "@/services/api";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import { ShoppingBag, ChevronLeft, ChevronRight, Star, Check, Package } from "lucide-react";
import { motion } from "framer-motion";

function StarRating({ rating = 4.5, count = 38 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/store/:storeSlug/products/:productId");
  const storeSlug = params?.storeSlug || "demo-store";
  const productId = parseInt(params?.productId || "0", 10);

  const { data: store } = useGetStore(storeSlug);
  const { data: product, isLoading } = useGetStoreProduct(storeSlug, productId);
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const { format } = useCurrency();
  const { toast } = useToast();

  const primaryColor = store?.primaryColor || "#7C3AED";

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useState(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  });

  if (isLoading) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="animate-pulse">
          <div className="w-full aspect-[4/5] bg-gray-100" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-100 rounded-full w-3/4" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2" />
            <div className="h-8 bg-gray-100 rounded-full w-1/3" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="p-20 text-center font-semibold text-lg text-gray-400 flex flex-col items-center gap-4">
          <Package className="w-12 h-12 text-gray-300" />
          المنتج غير موجود
        </div>
      </StoreLayout>
    );
  }

  const handleAddToCart = () => {
    if (product.variants?.sizes?.length && !selectedSize) {
      toast({ title: "الرجاء اختيار المقاس", variant: "destructive" });
      return;
    }
    if (product.variants?.colors?.length && !selectedColor) {
      toast({ title: "الرجاء اختيار اللون", variant: "destructive" });
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      selectedSize,
      selectedColor,
      imageUrl: product.images?.[0] ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast({
      title: "تم الإضافة للسلة ✓",
      description: product.name,
    });
  };

  const images = product.images?.length ? product.images : [""];
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="bg-white min-h-screen pb-32" dir={isRTL ? "rtl" : "ltr"}>

        {/* Back Button */}
        <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} z-10`}>
          <Link href={`/store/${storeSlug}/products`}>
            <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md text-gray-700 hover:bg-white transition-all hover:scale-105 active:scale-95">
              <BackIcon className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Image Carousel */}
        <div className="relative bg-gray-50 w-full aspect-[4/5] overflow-hidden">
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((img, idx) => (
                <div className="flex-[0_0_100%] min-w-0 h-full relative" key={idx}>
                  {img ? (
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center gap-3"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}20)` }}
                    >
                      <Package className="w-12 h-12 opacity-20" style={{ color: primaryColor }} />
                      <span className="text-sm text-gray-400 font-medium">لا توجد صورة</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}

          {/* Stock badge overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-sm font-black px-5 py-2.5 rounded-full tracking-wide">
                نفد المخزون
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-7">

          {/* Header */}
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.inStock ? (
                <>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    متوفر
                  </span>
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                    كميات محدودة
                  </span>
                </>
              ) : (
                <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                  غير متوفر
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>

            <StarRating />

            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black" style={{ color: primaryColor }}>
                {format(product.price)}
              </p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="rounded-2xl p-4"
              style={{ background: `${primaryColor}06`, border: `1px solid ${primaryColor}12` }}
            >
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Size Selector */}
          {product.variants?.sizes?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">{t.selectSize}</h3>
                {selectedSize && <span className="text-xs font-bold" style={{ color: primaryColor }}>{selectedSize}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.variants.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="h-11 px-5 rounded-xl text-sm font-bold transition-all border-2 relative"
                    style={
                      selectedSize === size
                        ? { background: primaryColor, color: "#fff", borderColor: primaryColor, boxShadow: `0 4px 16px ${primaryColor}40` }
                        : { background: "#f9fafb", color: "#374151", borderColor: "#f3f4f6" }
                    }
                  >
                    {selectedSize === size && <Check className="w-3 h-3 absolute top-1 right-1" />}
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.variants?.colors?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">{t.selectColor}</h3>
                {selectedColor && <span className="text-xs font-bold" style={{ color: primaryColor }}>{selectedColor}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.variants.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="h-11 px-5 rounded-xl text-sm font-bold transition-all border-2"
                    style={
                      selectedColor === color
                        ? { background: primaryColor, color: "#fff", borderColor: primaryColor, boxShadow: `0 4px 16px ${primaryColor}40` }
                        : { background: "#f9fafb", color: "#374151", borderColor: "#f3f4f6" }
                    }
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Add to Cart */}
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 pb-safe z-50 flex items-center gap-4"
          style={{ boxShadow: "0 -4px 30px rgba(0,0,0,0.08)" }}
        >
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{t.totalPrice}</p>
            <p className="text-xl font-black" style={{ color: primaryColor }}>{format(product.price)}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 h-[52px] rounded-2xl text-base font-black text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: added
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : product.inStock
                ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`
                : "#9ca3af",
              boxShadow: product.inStock && !added ? `0 4px 20px ${primaryColor}40` : added ? "0 4px 20px rgba(34,197,94,0.4)" : "none",
            }}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                تمت الإضافة
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                {product.inStock ? t.addToCart : t.soldOut}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </StoreLayout>
  );
}