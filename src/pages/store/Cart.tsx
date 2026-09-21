import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useGetStore } from "@/services/api";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Package, Tag, Truck, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const { format } = useCurrency();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const { data: store } = useGetStore();
  const primaryColor =
    store?.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number | null>(null);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode === "SAVE10" || cleanCode === "WELCOME" || cleanCode === "DUKKANI10" || cleanCode === "DUKKANI") {
      setAppliedDiscount(totalPrice * 0.1);
      toast({
        title: "تم تطبيق كود الخصم! 🎉",
        description: "حصلت على خصم 10% على كامل مشترياتك",
      });
    } else {
      toast({
        title: "كود الخصم غير صالح",
        description: "جرب استخدام الكود SAVE10",
        variant: "destructive",
      });
    }
  };

  const finalTotal = appliedDiscount ? Math.max(0, totalPrice - appliedDiscount) : totalPrice;

  return (
    <StoreLayout>
      <div className="flex flex-col min-h-full pb-32" dir={isRTL ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{t.cart}</h1>
            {items.length > 0 && (
              <p className="text-xs text-gray-400 font-medium mt-0.5">{itemCount} {t.quantity}</p>
            )}
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300">
              <Truck className="w-3.5 h-3.5" />
              <span>شحن مجاني</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* ── Empty State ─────────────────────────────── */
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6 px-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div
                className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto"
                style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}08)`, border: `2px dashed ${primaryColor}25` }}
              >
                <ShoppingBag className="w-12 h-12 opacity-30" style={{ color: primaryColor }} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-2"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">{t.yourCartIsEmpty}</h3>
              <p className="text-gray-400 max-w-[230px] mx-auto text-xs sm:text-sm leading-relaxed">
                {isRTL ? "أضف منتجات لسلتك للبدء في التسوق" : "Add products to start shopping"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <Link href="/store/products">
                <button
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white text-xs sm:text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.startShopping}
                </button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="px-5 pt-5 space-y-4">
            {/* Items List */}
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {items.map((item, idx) => (
                  <motion.div
                    key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? -40 : 40, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="flex gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-2xl relative overflow-hidden border border-gray-100 dark:border-slate-800"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    {/* Left color accent */}
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl" style={{ background: primaryColor }} />

                    {/* Product Image */}
                    <div className="w-[82px] h-[92px] bg-gray-50 dark:bg-slate-800 rounded-xl shrink-0 overflow-hidden ms-1">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 pe-7 min-w-0">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm leading-snug line-clamp-2">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.selectedSize && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 uppercase">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 uppercase">
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="font-black text-sm sm:text-base" style={{ color: primaryColor }}>
                          {format(item.price * item.quantity)}
                        </p>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-xl p-1 border border-gray-100 dark:border-slate-700">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 shadow-xs transition-all active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black w-4 text-center tabular-nums text-gray-900 dark:text-gray-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg text-white shadow-xs transition-all active:scale-90"
                            style={{ background: primaryColor }}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                      className="absolute top-3 end-3 w-7 h-7 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100 dark:border-slate-700"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Promo Code Input */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className={`w-3.5 h-3.5 text-gray-400 absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
                  <input
                    type="text"
                    placeholder="كود الخصم (مثال: SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`w-full h-10 ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"} rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-xs font-bold uppercase outline-none focus:border-red-400 transition-colors`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 h-10 rounded-xl text-xs font-black text-white shrink-0 shadow-sm active:scale-95 transition-all"
                  style={{ background: primaryColor }}
                >
                  تطبيق
                </button>
              </form>
              {appliedDiscount && (
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs text-green-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    تم تفعيل كود الخصم بنجاح
                  </span>
                  <span>-{format(appliedDiscount)}</span>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div
              className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ background: `${primaryColor}08`, borderBottom: `1px solid ${primaryColor}12` }}
              >
                <Tag className="w-4 h-4" style={{ color: primaryColor }} />
                <h3 className="font-black text-gray-900 dark:text-gray-100 text-xs">{t.orderSummary}</h3>
              </div>
              <div className="px-4 py-3.5 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">{t.subtotal} ({itemCount} {t.quantity})</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{format(totalPrice)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-xs text-green-600 font-bold">
                    <span>خصم الكوبون (10%)</span>
                    <span>-{format(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">الشحن</span>
                  <span className="font-bold text-green-600">مجاني</span>
                </div>
                <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex justify-between items-center">
                  <span className="font-black text-gray-900 dark:text-gray-100 text-sm">{t.total}</span>
                  <span className="font-black text-xl" style={{ color: primaryColor }}>{format(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/store/checkout" className="block pb-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full h-13 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  boxShadow: `0 6px 22px ${primaryColor}40`,
                }}
              >
                <span>{t.proceedToCheckout}</span>
                <Arrow className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

