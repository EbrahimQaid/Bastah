import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { Link } from "wouter";

interface MiniCartProps {
  storeSlug: string;
}

export function MiniCart({ storeSlug }: MiniCartProps) {
  const { items, totalItems, totalPrice, miniCartOpen, closeMiniCart, removeItem } = useCart();
  const { t, isRTL } = useLanguage();

  return (
    <AnimatePresence>
      {miniCartOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
            onClick={closeMiniCart}
          />
          <motion.div
            key="panel"
            dir={isRTL ? "rtl" : "ltr"}
            initial={{ x: isRTL ? "-100%" : "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRTL ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 bottom-0 w-[88%] max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
            style={isRTL ? { left: 0, right: "auto" } : { right: 0, left: "auto" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground text-base">{t.miniCartTitle}</h2>
              </div>
              <button
                onClick={closeMiniCart}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start py-3 border-b border-border/30 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground leading-snug truncate">{item.productName}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {item.selectedSize && (
                        <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {item.selectedColor}
                        </span>
                      )}
                    </div>
                    <p className="text-primary font-bold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.quantity}: {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t.yourCartIsEmpty}</p>
                </div>
              )}
            </div>

            {totalItems > 0 && (
              <div className="px-5 py-4 border-t border-border/50 space-y-3 bg-surface/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">{t.total}</span>
                  <span className="text-xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <Link href={`/store/${storeSlug}/cart`} onClick={closeMiniCart}>
                  <button className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-[0.98] transition-transform">
                    {t.cart}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
