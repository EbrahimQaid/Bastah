import { useRoute, useLocation, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useCreateOrder, useGetStore } from "@/services/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Lock, ChevronLeft, ChevronRight, Package, Truck, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function Checkout() {
  const [, params] = useRoute("/store/:storeSlug/checkout");
  const storeSlug = params?.storeSlug || "demo-store";
  const [, setLocation] = useLocation();

  const { items, totalPrice, clearCart } = useCart();
  const { format } = useCurrency();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data: store } = useGetStore(storeSlug);
  const primaryColor = store?.primaryColor || "#7C3AED";

  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.customerAddress) {
      toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { storeSlug, data: { ...form, items } },
      {
        onSuccess: () => { setSuccess(true); clearCart(); },
        onError: () => { toast({ title: "حدث خطأ، يرجى المحاولة مرة أخرى", variant: "destructive" }); },
      }
    );
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  /* ── Success Screen ───────────────────────────────────── */
  if (success) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center gap-7" dir={isRTL ? "rtl" : "ltr"}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-green-400" />
              <div className="relative w-28 h-28 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-black text-gray-900">{t.orderConfirmed}</h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[250px] mx-auto">{t.orderConfirmedDesc}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 w-full max-w-[260px]"
          >
            <button
              onClick={() => setLocation(`/store/${storeSlug}`)}
              className="w-full py-3.5 rounded-2xl text-white font-black text-sm transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                boxShadow: `0 4px 20px ${primaryColor}40`,
              }}
            >
              {t.continueShopping}
            </button>
          </motion.div>
        </div>
      </StoreLayout>
    );
  }

  /* ── Empty Cart ───────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-5">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: `${primaryColor}10`, border: `2px dashed ${primaryColor}25` }}
          >
            <ShoppingBag className="w-9 h-9 opacity-30" style={{ color: primaryColor }} />
          </div>
          <p className="font-bold text-gray-500">{t.yourCartIsEmpty}</p>
          <Link href={`/store/${storeSlug}`}>
            <button
              className="px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
            >
              {t.startShopping}
            </button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const inputCls = "w-full px-4 py-3.5 text-sm bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all font-medium text-gray-800 placeholder:text-gray-400";
  const inputFocusCls = `${inputCls} focus:border-[${primaryColor}] focus:ring-2`;

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="pb-28" dir={isRTL ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-5 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Link href={`/store/${storeSlug}/cart`}>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                <BackIcon className="w-4 h-4" />
              </button>
            </Link>
            <h1 className="text-base font-black tracking-tight text-gray-900">إتمام الطلب</h1>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Lock className="w-3 h-3" />
            آمن
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pt-5 space-y-4">

          {/* Contact Info Card */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
          >
            <div
              className="px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-50"
              style={{ background: `${primaryColor}06` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
                <Package className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
              <h2 className="font-black text-sm text-gray-900">بيانات التوصيل</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t.name} *</label>
                <input
                  required
                  className={inputCls}
                  style={{ fontFamily: "inherit" }}
                  placeholder={t.name}
                  value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t.phone} *</label>
                <input
                  required
                  type="tel"
                  className={inputCls}
                  placeholder="+9665XXXXXXXX"
                  value={form.customerPhone}
                  onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t.address} *</label>
                <textarea
                  required
                  className={`${inputCls} min-h-[88px] resize-none`}
                  placeholder={t.address}
                  value={form.customerAddress}
                  onChange={e => setForm({ ...form, customerAddress: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{t.notes}</label>
                <textarea
                  className={`${inputCls} min-h-[64px] resize-none`}
                  placeholder={t.notes}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Shipping Notice */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
          >
            <Truck className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">شحن مجاني لجميع المناطق 🎉</p>
              <p className="text-xs text-green-600 mt-0.5">التوصيل خلال 3-5 أيام عمل</p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div
            className="bg-white rounded-3xl overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
          >
            <div
              className="px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-50"
              style={{ background: `${primaryColor}06` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
                <ShoppingBag className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
              <h2 className="font-black text-sm text-gray-900">{t.orderSummary}</h2>
            </div>

            <div className="p-5 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.productName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-400">×{item.quantity}</span>
                      {item.selectedSize && (
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-lg text-gray-500 font-bold">{item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-lg text-gray-500 font-bold">{item.selectedColor}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-gray-900 whitespace-nowrap">{format(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold">{format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>الشحن</span>
                  <span className="font-bold text-green-600">مجاني</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-black text-gray-900">{t.total}</span>
                  <span className="font-black text-2xl" style={{ color: primaryColor }}>{format(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={createOrder.isPending}
            className="w-full h-14 text-base font-black rounded-2xl text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
              boxShadow: `0 4px 24px ${primaryColor}45`,
            }}
          >
            {createOrder.isPending ? (
              <span className="flex items-center gap-2.5">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري المعالجة…
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t.placeOrder}
              </>
            )}
          </motion.button>

          <p className="text-center text-[11px] text-gray-400 pb-4 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            معاملاتك محمية وآمنة
          </p>
        </form>
      </div>
    </StoreLayout>
  );
}
