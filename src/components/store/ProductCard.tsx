import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Sparkles, Check } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export interface ProductCardProps {
  product: any;
  primaryColor: string;
}

export function ProductCard({ product, primaryColor }: ProductCardProps) {
  const { format } = useCurrency();
  const { isRTL } = useLanguage();
  const { addItem, openMiniCart } = useCart();
  const { toast } = useToast();
  const [justAdded, setJustAdded] = useState(false);
  const [, setLocation] = useLocation();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants?.sizes?.length || product.variants?.colors?.length) {
      setLocation(`/store/products/${product.id}`);
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
        {/* Product Image Stage */}
        <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-zinc-800/70 overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Availability Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
              <span className="bg-white text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                {isRTL ? "نفد المخزون" : "Sold Out"}
              </span>
            </div>
          )}

          {/* Featured Subtle Marker */}
          {product.featured && product.inStock && (
            <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
              <span
                className="text-[10px] font-bold text-white px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1"
                style={{ background: primaryColor }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{isRTL ? "مختار" : "Curated"}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content & Metadata */}
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

export default ProductCard;
