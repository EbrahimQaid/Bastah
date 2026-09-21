import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStoreProduct, useGetStore } from "@/services/api";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import { ShoppingBag, ChevronLeft, ChevronRight, Star, Check, Package, ShieldCheck, Truck, RotateCcw, Plus, Minus, Share2 } from "lucide-react";
import { motion } from "framer-motion";

function StarRating({ rating = 4.9, count = 48 }: { rating?: number; count?: number }) {
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
      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count} تقييم موثق)</span>
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/store/products/:productId");
  const productId = parseInt(params?.productId || "0", 10);

  const { data: store } = useGetStore();
  const { data: product, isLoading } = useGetStoreProduct(undefined, productId);
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const { format } = useCurrency();
  const { toast } = useToast();

  const primaryColor = store?.primaryColor || "#7C3AED";

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  if (isLoading) {
    return (
      <StoreLayout hideBottomNav>
        <div className="animate-pulse">
          <div className="w-full aspect-[4/5] bg-gray-100 dark:bg-slate-800" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-100 dark:bg-slate-800 rounded-full w-3/4" />
            <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-full w-1/2" />
            <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded-full w-1/3" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout hideBottomNav>
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
      quantity,
      selectedSize,
      selectedColor,
      imageUrl: product.images?.[0] ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    toast({
      title: "تمت الإضافة للسلة ✓",
      description: `${quantity} × ${product.name}`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "تم نسخ رابط المنتج بنجاح" });
    }
  };

  const images = product.images?.length ? product.images : [""];
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <StoreLayout hideBottomNav>
      <div className="min-h-screen pb-[120px]" dir={isRTL ? "rtl" : "ltr"}>

        {/* Top Floating Actions */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <Link href="/store/products" className="pointer-events-auto">
            <button className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md text-gray-700 dark:text-gray-200 hover:bg-white transition-all hover:scale-105 active:scale-95 border border-white/40">
              <BackIcon className="w-5 h-5" />
            </button>
          </Link>

          <button
            onClick={handleShare}
            className="pointer-events-auto w-10 h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md text-gray-700 dark:text-gray-200 hover:bg-white transition-all hover:scale-105 active:scale-95 border border-white/40"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative bg-gray-50 dark:bg-slate-900 w-full aspect-[4/5] overflow-hidden">
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

          {/* Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/60"}`}
                />
              ))}
            </div>
          )}

          {/* Stock badge overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
              <span className="bg-white text-gray-900 text-sm font-black px-6 py-2 rounded-full tracking-wide shadow-xl">
                نفد المخزون
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => emblaApi?.scrollTo(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                  idx === selectedIndex ? "scale-105 shadow-md" : "opacity-60 hover:opacity-100"
                }`}
                style={{ borderColor: idx === selectedIndex ? primaryColor : "transparent" }}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-6">

          {/* Header */}
          <div className="space-y-2.5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.inStock ? (
                <>
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: "#dcfce7", color: "#16a34a" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    متوفر للشحن الفوري
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 rounded-full">
                    مخزون محدود
                  </span>
                </>
              ) : (
                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                  غير متوفر حالياً
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight">
              {product.name}
            </h1>

            <StarRating />

            <div className="flex items-baseline gap-2 pt-1">
              <p className="text-2xl sm:text-3xl font-black" style={{ color: primaryColor }}>
                {format(product.price)}
              </p>
              <span className="text-xs text-gray-400 font-semibold line-through">
                {format(product.price * 1.2)}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                وفر 20%
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div
              className="rounded-2xl p-4 bg-gray-50/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700"
            >
              <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mb-1.5">وصف المنتج</h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Size Selector */}
          {product.variants?.sizes?.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                  {t.selectSize}
                </h3>
                {selectedSize && <span className="text-xs font-bold" style={{ color: primaryColor }}>{selectedSize}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.variants.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="h-10 px-4 rounded-xl text-xs font-bold transition-all border relative"
                    style={
                      selectedSize === size
                        ? { background: primaryColor, color: "#fff", borderColor: primaryColor, boxShadow: `0 4px 14px ${primaryColor}40` }
                        : { background: "#f9fafb", color: "#374151", borderColor: "#e5e7eb" }
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
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                  {t.selectColor}
                </h3>
                {selectedColor && <span className="text-xs font-bold" style={{ color: primaryColor }}>{selectedColor}</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.variants.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="h-10 px-4 rounded-xl text-xs font-bold transition-all border"
                    style={
                      selectedColor === color
                        ? { background: primaryColor, color: "#fff", borderColor: primaryColor, boxShadow: `0 4px 14px ${primaryColor}40` }
                        : { background: "#f9fafb", color: "#374151", borderColor: "#e5e7eb" }
                    }
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <div>
              <p className="text-xs font-black text-gray-900 dark:text-gray-100">الكمية المطلوبة</p>
              <p className="text-[10px] text-gray-400">حدد عدد القطع</p>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 active:scale-95 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-black text-gray-900 dark:text-gray-100">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 active:scale-95 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Store Assurance / Trust Features */}
          <div className="rounded-2xl p-4 bg-gray-50/80 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">شحن سريع مع إمكانية التتبع المباشر</p>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">إمكانية الاستبدال والاسترجاع خلال 14 يوم</p>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">منتج مضمون وأصلي 100%</p>
            </div>
          </div>
        </div>

        {/* Sticky Add to Cart — Glassmorphism Bottom Bar */}
        <div
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-md bottom-0 z-50 p-4"
        >
          <div
            className="rounded-3xl p-3 px-4 flex items-center gap-4 border"
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(24px) saturate(200%)",
              WebkitBackdropFilter: "blur(24px) saturate(200%)",
              borderColor: "rgba(0,0,0,0.08)",
              boxShadow: "0 10px 35px -5px rgba(0,0,0,0.18)",
            }}
          >
            <div className="shrink-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.totalPrice}</p>
              <p className="text-lg font-black" style={{ color: primaryColor }}>
                {format(product.price * quantity)}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="flex-1 h-12 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{
                background: added
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : product.inStock
                  ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
                  : "#9ca3af",
                boxShadow: product.inStock && !added ? `0 4px 18px ${primaryColor}45` : added ? "0 4px 18px rgba(34,197,94,0.4)" : "none",
              }}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>تمت الإضافة للسلة</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.inStock ? t.addToCart : t.soldOut}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
