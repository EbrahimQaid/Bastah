import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStoreProduct, useGetStore } from "@/services/api";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Share2,
} from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/store/products/:productId");
  const productId = parseInt(params?.productId || "0", 10);

  const { data: store } = useGetStore();
  const { data: product, isLoading } = useGetStoreProduct(undefined, productId);
  const { addItem, openMiniCart } = useCart();
  const { t, isRTL } = useLanguage();
  const { format } = useCurrency();
  const { toast } = useToast();

  const primaryColor =
    store?.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
            <div className="lg:col-span-6 aspect-[4/3] bg-neutral-200 dark:bg-zinc-800 rounded-3xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-6 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-1/3" />
              <div className="h-10 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-3/4" />
              <div className="h-8 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-1/4" />
              <div className="h-24 bg-neutral-200 dark:bg-zinc-800 rounded-lg w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-neutral-400">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {isRTL ? "المنتج غير موجود" : "Product not found"}
          </h2>
          <Link href="/store/products">
            <button
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white"
              style={{ background: primaryColor }}
            >
              {isRTL ? "العودة للكتالوج" : "Back to catalog"}
            </button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : typeof product.images === "string" && product.images
      ? [product.images]
      : ["/images/product_luxury_thobe_1790631673826.jpg"];

  const handleAddToCart = () => {
    if (product.variants?.sizes?.length && !selectedSize) {
      toast({
        title: isRTL ? "يرجى تحديد المقاس أولاً" : "Please select a size",
        variant: "destructive",
      });
      return;
    }
    if (product.variants?.colors?.length && !selectedColor) {
      toast({
        title: isRTL ? "يرجى تحديد اللون أولاً" : "Please select a color",
        variant: "destructive",
      });
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      selectedSize,
      selectedColor,
      imageUrl: images[0],
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openMiniCart();
    toast({
      title: isRTL ? "تمت الإضافة بنجاح" : "Successfully added",
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
      toast({ title: isRTL ? "تم نسخ رابط المنتج إلى الحافظة" : "Product link copied" });
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/store" className="hover:text-neutral-700 dark:hover:text-zinc-200">
            {isRTL ? "الرئيسية" : "Home"}
          </Link>
          <span>/</span>
          <Link href="/store/products" className="hover:text-neutral-700 dark:hover:text-zinc-200">
            {isRTL ? "المنتجات" : "Products"}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 dark:text-white font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* ── 2-Column Responsive PDP Architecture ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Visual Gallery Stage */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-zinc-800 border border-neutral-200/80 dark:border-zinc-800/80 shadow-sm">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                  <span className="bg-white text-neutral-900 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                    {isRTL ? "نفد المخزون حالياً" : "Out of Stock"}
                  </span>
                </div>
              )}

              <button
                onClick={handleShare}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center text-neutral-700 dark:text-zinc-300 shadow-sm hover:scale-105 transition-transform"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-red-600 scale-105 shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3 pb-6 border-b border-neutral-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {product.categoryName || (isRTL ? "تشكيلة مختارة" : "Curated Selection")}
                </span>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>{isRTL ? "متوفر للشحن الفوري" : "In Stock"}</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                    {isRTL ? "غير متوفر" : "Sold Out"}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
                  {format(product.price)}
                </span>
                <span className="text-sm font-mono text-neutral-400 line-through">
                  {format(product.price * 1.25)}
                </span>
                <span className="text-[11px] font-bold text-green-700 bg-green-50 dark:bg-green-950/50 px-2 py-0.5 rounded-md">
                  {isRTL ? "وفر 20%" : "20% Off"}
                </span>
              </div>
            </div>

            {/* Sizes Selection */}
            {product.variants?.sizes?.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {isRTL ? "اختر المقاس:" : "Select Size:"}
                  </span>
                  {selectedSize && (
                    <span className="font-mono text-neutral-500">{selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 px-4 rounded-xl text-xs font-bold transition-all border ${
                        selectedSize === size
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                          : "bg-white dark:bg-zinc-900 text-neutral-700 dark:text-zinc-300 border-neutral-200 dark:border-zinc-800 hover:border-neutral-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Selection */}
            {product.variants?.colors?.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {isRTL ? "اختر اللون:" : "Select Color:"}
                  </span>
                  {selectedColor && (
                    <span className="font-mono text-neutral-500">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-11 px-4 rounded-xl text-xs font-bold transition-all border ${
                        selectedColor === color
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                          : "bg-white dark:bg-zinc-900 text-neutral-700 dark:text-zinc-300 border-neutral-200 dark:border-zinc-800 hover:border-neutral-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & CTA Row */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-200 dark:border-zinc-800 rounded-xl bg-neutral-50 dark:bg-zinc-900 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-neutral-600 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-neutral-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-neutral-600 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md disabled:opacity-40"
                  style={{
                    background: added
                      ? "#16a34a"
                      : product.inStock
                      ? `linear-gradient(135deg, ${primaryColor}, #DC2626)`
                      : "#737373",
                  }}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{isRTL ? "تمت الإضافة بنجاح ✓" : "Added to Bag"}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {product.inStock
                          ? isRTL
                            ? `إضافة إلى السلة (${format(product.price * quantity)})`
                            : `Add to Bag · ${format(product.price * quantity)}`
                          : isRTL
                          ? "المنتج غير متوفر"
                          : "Sold Out"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description Tab/Card */}
            {product.description && (
              <div className="pt-4 border-t border-neutral-200/80 dark:border-zinc-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  {isRTL ? "تفاصيل ومواصفات المنتج" : "Product Specifications"}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Trust Assurances */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-3 text-xs text-neutral-700 dark:text-zinc-300">
                <Truck className="w-4 h-4 text-green-600 shrink-0" />
                <span>{isRTL ? "شحن سريع لكافة المدن مع إمكانية التتبع" : "Express door-to-door delivery with tracking"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-700 dark:text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{isRTL ? "منتج أصلي 100% ومضمون من المتجر" : "100% Guaranteed authentic item"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-700 dark:text-zinc-300">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{isRTL ? "استبدال واسترجاع ميسر خلال 14 يوماً" : "14-Day flexible exchange & return policy"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Add to Cart (Only visible on mobile screens) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-zinc-800 p-3 flex items-center gap-3 safe-area-pb">
          <div>
            <span className="text-[10px] text-neutral-400 block leading-none">
              {isRTL ? "الإجمالي" : "Total"}
            </span>
            <span className="text-base font-black font-mono tabular-nums text-neutral-900 dark:text-white">
              {format(product.price * quantity)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 h-11 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            style={{
              background: added
                ? "#16a34a"
                : product.inStock
                ? primaryColor
                : "#737373",
            }}
          >
            {added ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            <span>{added ? (isRTL ? "تمت الإضافة" : "Added") : (isRTL ? "أضف للسلة" : "Add to Bag")}</span>
          </button>
        </div>
      </div>
    </StoreLayout>
  );
}
