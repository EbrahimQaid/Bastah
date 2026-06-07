import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useGetStore } from "@/services/api";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, Package, Tag, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [, params] = useRoute("/store/:storeSlug/cart");
  const storeSlug = params?.storeSlug || "demo-store";

  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const { format } = useCurrency();
  const { t, isRTL } = useLanguage();
  const { data: store } = useGetStore(storeSlug);
  const primaryColor = store?.primaryColor || "#7C3AED";

  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col min-h-full pb-32" dir={isRTL ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t.cart}</h1>
          {items.length > 0 && (
            <p className="text-sm text-gray-400 font-medium mt-0.5">{itemCount} {t.quantity}</p>
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
              <h3 className="text-xl font-black text-gray-900">{t.yourCartIsEmpty}</h3>
              <p className="text-gray-400 max-w-[230px] mx-auto text-sm leading-relaxed">
                {isRTL ? "أضف منتجات لسلتك للبدء في التسوق" : "Add products to start shopping"}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              <Link href={`/store/${storeSlug}/products`}>
                <button
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white text-sm font-black transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                    boxShadow: `0 4px 20px ${primaryColor}40`,
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t.startShopping}
                </button>
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="px-5 pt-5 space-y-5">
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
                    className="flex gap-3 p-3.5 bg-white rounded-2xl relative overflow-hidden"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    {/* Left color accent */}
                    <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl" style={{ background: primaryColor }} />

                    {/* Product Image */}
                    <div className="w-[88px] h-[100px] bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden ms-1">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5 pe-8 min-w-0">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.selectedSize && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="font-black text-base" style={{ color: primaryColor }}>
                          {format(item.price * item.quantity)}
                        </p>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 shadow-sm transition-all active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-black w-5 text-center tabular-nums text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center rounded-full text-white shadow-sm transition-all active:scale-90"
                            style={{ background: primaryColor }}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                      className="absolute top-3 end-3 w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Shipping Banner */}
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <Truck className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">شحن مجاني 🎉</p>
                <p className="text-xs text-green-600">توصيل لجميع المناطق</p>
              </div>
            </div>

            {/* Order Summary */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ background: `${primaryColor}08`, borderBottom: `1px solid ${primaryColor}12` }}
              >
                <Tag className="w-4 h-4" style={{ color: primaryColor }} />
                <h3 className="font-black text-gray-900 text-sm">{t.orderSummary}</h3>
              </div>
              <div className="bg-white px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.subtotal} ({itemCount} {t.quantity})</span>
                  <span className="font-bold text-gray-900">{format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">الشحن</span>
                  <span className="font-bold text-green-600">مجاني</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-black text-gray-900">{t.total}</span>
                  <span className="font-black text-2xl" style={{ color: primaryColor }}>{format(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Checkout */}
            <Link href={`/store/${storeSlug}/checkout`} className="block pb-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full h-[54px] rounded-2xl text-white font-black text-base flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                  boxShadow: `0 4px 24px ${primaryColor}45`,
                }}
              >
                {t.proceedToCheckout}
                <Arrow className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
