import { useLocation, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useCreateOrder, useGetStore } from "@/services/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Lock, ChevronLeft, ChevronRight, Package, Truck, ShoppingBag, Banknote, ShieldCheck, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function Checkout() {
  const [, setLocation] = useLocation();

  const { items, totalPrice, clearCart } = useCart();
  const { format } = useCurrency();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data: store } = useGetStore();
  const primaryColor = store?.primaryColor || "#7C3AED";

  const shippingRate = Number(store?.shippingRate || 0);

  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | number>("");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.customerAddress.trim()) {
      toast({ title: "يرجى تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { data: { ...form, items } },
      {
        onSuccess: (res: any) => {
          setCreatedOrderId(res?.id || Math.floor(100000 + Math.random() * 900000));
          setSuccess(true);
          clearCart();
        },
        onError: () => {
          toast({ title: "حدث خطأ، يرجى المحاولة مرة أخرى", variant: "destructive" });
        },
      }
    );
  };

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  /* ── Success Screen ───────────────────────────────────── */
  if (success) {
    return (
      <StoreLayout>
        <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center gap-6" dir={isRTL ? "rtl" : "ltr"}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-green-400" />
              <div className="relative w-24 h-24 rounded-full bg-green-50 dark:bg-green-950/40 border-4 border-green-200 dark:border-green-800 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            {createdOrderId && (
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-500">
                رقم الطلب #{createdOrderId}
              </span>
            )}
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">{t.orderConfirmed}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-[260px] mx-auto">
              {t.orderConfirmedDesc}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col gap-3 w-full max-w-[280px]"
          >
            {store?.whatsappNumber && (
              <a
                href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `مرحباً، قمت بإتمام طلب رقم #${createdOrderId} باسم ${form.customerName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 text-white shadow-md active:scale-95 transition-all"
                style={{ background: "#25D366" }}
              >
                <Phone className="w-4 h-4" />
                تأكيد الطلب عبر واتساب
              </a>
            )}

            <button
              onClick={() => setLocation("/store")}
              className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-[0.98] bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
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
      <StoreLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-5">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: `${primaryColor}10`, border: `2px dashed ${primaryColor}25` }}
          >
            <ShoppingBag className="w-9 h-9 opacity-30" style={{ color: primaryColor }} />
          </div>
          <p className="font-bold text-gray-500 dark:text-gray-400">{t.yourCartIsEmpty}</p>
          <Link href="/store">
            <button
              className="px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
            >
              {t.startShopping}
            </button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const inputCls = "w-full px-4 py-3 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none transition-all font-medium text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-purple-400";

  return (
    <StoreLayout>
      <div className="pb-28" dir={isRTL ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <Link href="/store/cart">
              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 transition-colors text-gray-600 dark:text-gray-300">
                <BackIcon className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-gray-900 dark:text-gray-100">إتمام الطلب</h1>
              <p className="text-[10px] text-gray-400">خطوة أخيرة لتأكيد مشترياتك</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-1 rounded-full uppercase">
            <Lock className="w-3 h-3" />
            مشفر وآمن
          </div>
        </div>

        {/* Step Progression */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center text-[10px] font-black">✓</span>
              <span>السلة</span>
            </div>
            <div className="flex-1 h-[2px] bg-green-200 dark:bg-green-900 mx-2" />
            <div className="flex items-center gap-1.5" style={{ color: primaryColor }}>
              <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-black" style={{ background: primaryColor }}>2</span>
              <span className="font-black">بيانات التوصيل</span>
            </div>
            <div className="flex-1 h-[2px] bg-gray-200 dark:bg-slate-700 mx-2" />
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">3</span>
              <span>التأكيد</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pt-3 space-y-4">

          {/* Contact Info Card */}
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800"
            style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.04)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2.5 border-b border-gray-50 dark:border-slate-800"
              style={{ background: `${primaryColor}06` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
                <Package className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
              <h2 className="font-black text-xs sm:text-sm text-gray-900 dark:text-gray-100">بيانات التوصيل والعميل</h2>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.name} *</label>
                <input
                  required
                  className={inputCls}
                  placeholder="اسم المستلم بالكامل"
                  value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.phone} *</label>
                <input
                  required
                  type="tel"
                  className={inputCls}
                  placeholder="+966 5X XXX XXXX"
                  value={form.customerPhone}
                  onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.address} *</label>
                <textarea
                  required
                  className={`${inputCls} min-h-[76px] resize-none`}
                  placeholder="المدينة، الحي، اسم الشارع، رقم المبنى"
                  value={form.customerAddress}
                  onChange={e => setForm({ ...form, customerAddress: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t.notes}</label>
                <textarea
                  className={`${inputCls} min-h-[58px] resize-none`}
                  placeholder="أي ملاحظات خاصة بالتوصيل أو التوقيت المفضل..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Option */}
          <div
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
                <Banknote className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-gray-100">الدفع عند الاستلام (COD)</p>
                <p className="text-[10px] text-gray-400">ادفع نقداً أو عبر بطاقتك لمندوب التوصيل</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black shadow-xs" style={{ background: primaryColor }}>
              ✓
            </div>
          </div>

          {/* Shipping Notice */}
          <div
            className="flex items-center gap-3 p-3.5 rounded-2xl"
            style={{
              background: shippingRate === 0 ? "#f0fdf4" : "#fef8f2",
              border: shippingRate === 0 ? "1px solid #bbf7d0" : "1px solid #fbd38d"
            }}
          >
            <Truck className="w-4 h-4 shrink-0" style={{ color: shippingRate === 0 ? "#16a34a" : "#dd6b20" }} />
            <div>
              <p className="text-xs font-bold" style={{ color: shippingRate === 0 ? "#166534" : "#9c4221" }}>
                {shippingRate === 0 ? "شحن مجاني لجميع المناطق 🎉" : `تكلفة الشحن الثابتة: ${format(shippingRate)}`}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: shippingRate === 0 ? "#16a34a" : "#dd6b20" }}>
                التوصيل المتوقع خلال 2-4 أيام عمل
              </p>
            </div>
          </div>

          {/* Order Summary Card */}
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800"
            style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.04)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2.5 border-b border-gray-50 dark:border-slate-800"
              style={{ background: `${primaryColor}06` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${primaryColor}15` }}>
                <ShoppingBag className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              </div>
              <h2 className="font-black text-xs sm:text-sm text-gray-900 dark:text-gray-100">{t.orderSummary}</h2>
            </div>

            <div className="p-4 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{item.productName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-gray-400">×{item.quantity}</span>
                      {item.selectedSize && (
                        <span className="text-[9px] bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-gray-500 font-bold">{item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="text-[9px] bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-gray-500 font-bold">{item.selectedColor}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">{format(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 dark:border-slate-800 pt-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>الشحن</span>
                  {shippingRate === 0 ? (
                    <span className="font-bold text-green-600">مجاني</span>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{format(shippingRate)}</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-slate-800">
                  <span className="font-black text-gray-900 dark:text-gray-100 text-sm">{t.total}</span>
                  <span className="font-black text-xl" style={{ color: primaryColor }}>{format(totalPrice + shippingRate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={createOrder.isPending}
            className="w-full h-13 text-sm font-black rounded-2xl text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              boxShadow: `0 6px 22px ${primaryColor}40`,
            }}
          >
            {createOrder.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري تأكيد الطلب…
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.placeOrder}</span>
              </>
            )}
          </motion.button>

          <p className="text-center text-[10px] text-gray-400 pb-4 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            طلبك مؤكد 100% مع ضمان استرجاع مجاني
          </p>
        </form>
      </div>
    </StoreLayout>
  );
}

