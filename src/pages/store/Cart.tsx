import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useGetStore } from "@/services/api";
import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Package,
  Tag,
  Truck,
  Check,
  ShieldCheck,
} from "lucide-react";
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
    if (
      cleanCode === "SAVE10" ||
      cleanCode === "WELCOME" ||
      cleanCode === "DUKKANI10" ||
      cleanCode === "DUKKANI"
    ) {
      setAppliedDiscount(totalPrice * 0.1);
      toast({
        title: isRTL ? "تم تطبيق كود الخصم! 🎉" : "Promo code applied!",
        description: isRTL ? "حصلت على خصم 10% على إجمالي مشترياتك" : "You received 10% off your entire order",
      });
    } else {
      toast({
        title: isRTL ? "كود الخصم غير صالح" : "Invalid promo code",
        description: isRTL ? "جرب استخدام الكود DUKKANI10" : "Try using coupon DUKKANI10",
        variant: "destructive",
      });
    }
  };

  const finalTotal = appliedDiscount ? Math.max(0, totalPrice - appliedDiscount) : totalPrice;

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <Link href="/store" className="hover:text-neutral-700 dark:hover:text-zinc-200">
                {isRTL ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-neutral-900 dark:text-white font-semibold">
                {isRTL ? "سلة الشراء" : "Shopping Bag"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isRTL ? "سلة المشتريات" : "Shopping Bag"}
            </h1>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 px-3 py-1.5 rounded-full">
              <Truck className="w-4 h-4" />
              <span>{isRTL ? "شحن مجاني متوفر" : "Free Delivery Eligible"}</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-5 bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/80 dark:border-zinc-800/80 p-8">
            <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-400">
              <ShoppingBag className="w-10 h-10 opacity-40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                {isRTL ? "سلتك فارغة حالياً" : "Your shopping bag is empty"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {isRTL
                  ? "تصفح أحدث المنتجات وأضف ما يعجبك لتبدأ عملية الشراء."
                  : "Explore our collection and add your favorite items to begin purchasing."}
              </p>
            </div>
            <Link href="/store/products">
              <button
                className="px-8 py-3 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-transform"
                style={{ background: primaryColor }}
              >
                {isRTL ? "تصفح المنتجات الآن" : "Explore Catalog"}
              </button>
            </Link>
          </div>
        ) : (
          /* 2-Column Desktop Cart */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 flex gap-4 items-center"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-20 rounded-xl bg-neutral-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-neutral-100 dark:border-zinc-800">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Info & Options */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <Link href={`/store/products/${item.productId}`}>
                          <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug truncate hover:underline">
                            {item.productName}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                          {item.selectedSize && (
                            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-zinc-800 font-mono">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-zinc-800 font-mono">
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                        <p className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                          {format(item.price)}
                        </p>
                      </div>

                      {/* Stepper & Subtotal */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center border border-neutral-200 dark:border-zinc-800 rounded-xl bg-neutral-50 dark:bg-zinc-800 p-1">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-neutral-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs text-neutral-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.selectedSize,
                                item.selectedColor,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-neutral-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white w-20 text-end">
                          {format(item.price * item.quantity)}
                        </span>

                        <button
                          onClick={() =>
                            removeItem(item.productId, item.selectedSize, item.selectedColor)
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-600 transition-colors"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Promo Code Box */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-neutral-400 absolute right-3 rtl:right-3 rtl:left-auto left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={isRTL ? "أدخل كود الخصم (مثال: DUKKANI10)" : "Enter promo code"}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full h-10 px-9 rounded-xl bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-xs font-mono uppercase outline-none focus:border-red-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 h-10 rounded-xl text-xs font-bold text-white transition-opacity shadow-xs"
                    style={{ background: primaryColor }}
                  >
                    {isRTL ? "تطبيق" : "Apply"}
                  </button>
                </form>

                {appliedDiscount && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100 dark:border-zinc-800 text-xs text-green-600 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>{isRTL ? "تم تفعيل خصم 10% بنجاح" : "10% Discount Applied"}</span>
                    </span>
                    <span className="font-mono">-{format(appliedDiscount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Sticky Order Summary */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 space-y-4 shadow-sm">
                <h2 className="font-bold text-base text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-zinc-800">
                  {isRTL ? "ملخص الطلب" : "Order Summary"}
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-zinc-400">
                    <span>{isRTL ? "المجموع الفرعي" : "Subtotal"} ({itemCount} {isRTL ? "قطع" : "items"})</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {format(totalPrice)}
                    </span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>{isRTL ? "قيمة الخصم (10%)" : "Promo Discount"}</span>
                      <span className="font-mono">-{format(appliedDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600 dark:text-zinc-400">
                    <span>{isRTL ? "الشحن والتوصيل" : "Shipping"}</span>
                    <span className="font-bold text-green-600">
                      {isRTL ? "مجاني" : "Free"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 dark:border-zinc-800 flex justify-between items-baseline">
                    <span className="font-black text-sm text-neutral-900 dark:text-white">
                      {isRTL ? "المجموع الكلي" : "Total"}
                    </span>
                    <span className="font-black font-mono text-2xl" style={{ color: primaryColor }}>
                      {format(finalTotal)}
                    </span>
                  </div>
                </div>

                <Link href="/store/checkout">
                  <button
                    className="w-full h-12 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.98] shadow-md mt-2"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, #DC2626)`,
                    }}
                  >
                    <span>{isRTL ? "متابعة إتمام الطلب" : "Proceed to Checkout"}</span>
                    <Arrow className="w-4 h-4" />
                  </button>
                </Link>

                <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>{isRTL ? "معاملة آمنة ومضمونة 100%" : "100% Secure Checkout"}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
