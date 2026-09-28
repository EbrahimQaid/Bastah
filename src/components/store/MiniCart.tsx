import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, ArrowLeft, Package, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { Link } from "wouter";

export function MiniCart() {
  const { items, totalItems, totalPrice, miniCartOpen, closeMiniCart, removeItem } = useCart();
  const { t, isRTL } = useLanguage();
  const { format } = useCurrency();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60]"
            onClick={closeMiniCart}
          />
          <motion.div
            key="panel"
            dir={isRTL ? "rtl" : "ltr"}
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-[70] flex flex-col border-s border-neutral-200 dark:border-zinc-800"
            style={isRTL ? { left: 0, right: "auto" } : { right: 0, left: "auto" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-neutral-900 dark:text-white" />
                <h2 className="font-bold text-base text-neutral-900 dark:text-white">
                  {isRTL ? "سلة الشراء" : "Shopping Bag"}
                </h2>
                {totalItems > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeMiniCart}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-500 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3.5 p-3 rounded-2xl bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-100 dark:border-zinc-800 items-center"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-zinc-700">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                      {item.productName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500">
                      {item.selectedSize && (
                        <span className="px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-zinc-700 font-mono">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-zinc-700 font-mono">
                          {item.selectedColor}
                        </span>
                      )}
                      <span>·</span>
                      <span className="font-mono">× {item.quantity}</span>
                    </div>
                    <p className="font-mono font-bold text-xs text-neutral-900 dark:text-white mt-1">
                      {format(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-zinc-700 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-20 text-neutral-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold">
                    {isRTL ? "سلة مشترياتك فارغة حالياً" : "Your shopping bag is empty"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Subtotal & Actions */}
            {totalItems > 0 && (
              <div className="p-6 border-t border-neutral-200/80 dark:border-zinc-800/80 space-y-3 bg-neutral-50/70 dark:bg-zinc-950/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-500 dark:text-zinc-400">
                    {isRTL ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span className="text-lg font-black font-mono tabular-nums text-neutral-900 dark:text-white">
                    {format(totalPrice)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link href="/store/cart" onClick={closeMiniCart}>
                    <button className="w-full h-11 bg-white hover:bg-neutral-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-900 dark:text-white font-bold text-xs rounded-xl border border-neutral-200 dark:border-zinc-700 transition-colors">
                      {isRTL ? "عرض السلة" : "View Bag"}
                    </button>
                  </Link>

                  <Link href="/store/checkout" onClick={closeMiniCart}>
                    <button className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm">
                      <span>{isRTL ? "إتمام الطلب" : "Checkout"}</span>
                      <Arrow className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
