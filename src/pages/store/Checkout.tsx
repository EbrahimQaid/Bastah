import { useLocation, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useCreateOrder, useGetStore } from "@/services/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  ShoppingBag,
  Banknote,
  ShieldCheck,
  Phone,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Checkout() {
  const [, setLocation] = useLocation();

  const { items, totalPrice, clearCart, appliedCoupon, discountAmount, finalTotal } = useCart();
  const { format, activeCurrency } = useCurrency();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data: store } = useGetStore();
  const primaryColor =
    store?.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

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
      toast({
        title: isRTL ? "يرجى تعبئة كافة الحقول المطلوبة" : "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createOrder.mutate(
      {
        data: {
          ...form,
          items,
          couponCode: appliedCoupon?.code || undefined,
          currency: activeCurrency,
        },
      },
      {
        onSuccess: (res: any) => {
          const orderId = res?.id || Math.floor(100000 + Math.random() * 900000);
          try {
            sessionStorage.setItem(`dukkani_receipt_${orderId}`, JSON.stringify(res));
          } catch {}
          clearCart();
          setLocation(`/store/order-success/${orderId}`);
        },
        onError: (err: any) => {
          toast({
            title: isRTL ? "تعذر إتمام الطلب، يرجى المحاولة ثانية" : "Failed to place order",
            description: err?.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  /* ── Order Confirmed Success Screen ── */
  if (success) {
    return (
      <StoreLayout hideBottomNav={true}>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/40 border-2 border-green-200 dark:border-green-800 flex items-center justify-center mx-auto text-green-600 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300">
              {isRTL ? `رقم الطلب #${createdOrderId}` : `Order #${createdOrderId}`}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isRTL ? "تم استلام وتأكيد طلبك بنجاح!" : "Order Successfully Confirmed!"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              {isRTL
                ? `شكراً لثقتك بنا يا ${form.customerName}! سنقوم بتجهيز وشحن طلبك بأسرع وقت، وسيصلك إشعار عند انطلاق الشحنة.`
                : `Thank you for your order, ${form.customerName}! We are preparing your shipment.`}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            {store?.whatsappNumber && (
              <a
                href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `مرحباً، قمت بإتمام طلب رقم #${createdOrderId} باسم ${form.customerName}. أود متابعة حالة الشحن.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20ba59] flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>{isRTL ? "متابعة الطلب عبر واتساب" : "Track via WhatsApp"}</span>
              </a>
            )}

            <button
              onClick={() => setLocation("/store")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 text-neutral-800 dark:text-zinc-200 transition-colors"
            >
              {isRTL ? "العودة للتسوق" : "Continue Shopping"}
            </button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  /* ── Empty Cart Guard ── */
  if (items.length === 0) {
    return (
      <StoreLayout hideBottomNav={true}>
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {isRTL ? "لا توجد عناصر في السلة لإتمام الطلب" : "Your shopping bag is empty"}
          </h2>
          <Link href="/store">
            <button
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm"
              style={{ background: primaryColor }}
            >
              {isRTL ? "ابدأ التسوق الآن" : "Start Shopping"}
            </button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const inputClass =
    "w-full h-11 px-4 text-xs sm:text-sm bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-xl outline-none transition-colors font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-red-500";

  return (
    <StoreLayout hideBottomNav={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Lock Seal */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <Link href="/store/cart" className="hover:text-neutral-700 dark:hover:text-zinc-200">
                {isRTL ? "السلة" : "Bag"}
              </Link>
              <span>/</span>
              <span className="text-neutral-900 dark:text-white font-semibold">
                {isRTL ? "إتمام الشراء" : "Checkout"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              {isRTL ? "إتمام الشراء وتأكيد الطلب" : "Secure Checkout"}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 dark:bg-green-950/40 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>{isRTL ? "دفع آمن ومحمي" : "Encrypted & Secure"}</span>
          </div>
        </div>

        {/* ── 2-Column Responsive Checkout Architecture ── */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Customer & Delivery Information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-zinc-800">
                <Package className="w-4 h-4 text-neutral-500" />
                <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {isRTL ? "بيانات المستلم وعنوان التوصيل" : "Recipient & Delivery Address"}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block mb-1">
                    {isRTL ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder={isRTL ? "مثال: عبدالله اليماني" : "e.g. John Doe"}
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block mb-1">
                    {isRTL ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp Number *"}
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+967 7X XXX XXXX"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block mb-1">
                    {isRTL ? "عنوان التوصيل بالتفصيل *" : "Detailed Shipping Address *"}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      isRTL
                        ? "المدينة، الحي، اسم الشارع، رقم المنزل أو أقرب معلم..."
                        : "City, district, street name, house number..."
                    }
                    value={form.customerAddress}
                    onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                    className="w-full p-3.5 text-xs sm:text-sm bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-xl outline-none font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-red-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-zinc-300 block mb-1">
                    {isRTL ? "ملاحظات إضافية (اختياري)" : "Delivery Instructions (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder={isRTL ? "توقيت التسليم المفضل أو توجيه للمندوب..." : "Special notes..."}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-2 pb-2">
                <Banknote className="w-4 h-4 text-neutral-500" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {isRTL ? "طريقة الدفع" : "Payment Method"}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-800/70 border-2 border-red-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                      {isRTL ? "الدفع عند الاستلام (COD)" : "Cash on Delivery"}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {isRTL ? "ادفع نقداً أو عبر البطاقة بعد استلام الطلب وفحصه" : "Pay in cash upon inspection of delivery"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600">{isRTL ? "مفعل" : "Active"}</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Order Overview & Final CTA */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 space-y-4 shadow-sm">
              <h2 className="font-bold text-base text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-zinc-800">
                {isRTL ? "ملخص المشتريات" : "Order Review"} ({items.length})
              </h2>

              {/* Items Compact Review */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-neutral-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-neutral-400 text-[11px] font-mono">
                        {item.quantity} × {format(item.price)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-neutral-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-zinc-400">
                  <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {format(totalPrice)}
                  </span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {isRTL ? "قيمة الخصم" : "Discount"} ({appliedCoupon.code})
                      </span>
                    </span>
                    <span className="font-mono tabular-nums">-{format(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600 dark:text-zinc-400">
                  <span>{isRTL ? "رسوم الشحن والتوصيل" : "Shipping"}</span>
                  {shippingRate === 0 ? (
                    <span className="font-bold text-green-600">{isRTL ? "مجاني" : "Free"}</span>
                  ) : (
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {format(shippingRate)}
                    </span>
                  )}
                </div>
                <div className="pt-3 border-t border-neutral-200 dark:border-zinc-800 flex justify-between items-baseline">
                  <span className="font-black text-sm text-neutral-900 dark:text-white">
                    {isRTL ? "المجموع النهائي" : "Total to Pay"}
                  </span>
                  <span className="font-black font-mono text-2xl" style={{ color: primaryColor }}>
                    {format(finalTotal + shippingRate)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={createOrder.isPending}
                className="w-full h-13 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.98] shadow-md disabled:opacity-50 mt-2"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #DC2626)`,
                }}
              >
                {createOrder.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isRTL ? "جاري تسجيل وتأكيد الطلب..." : "Confirming Order..."}</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isRTL ? "تأكيد وإتمام الطلب الآن" : "Confirm & Place Order"}</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-neutral-400 text-center space-y-1 pt-1">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  <span>{isRTL ? "طلبك محمي ومضمون 100%" : "100% Protected Order"}</span>
                </p>
                <p>
                  {isRTL
                    ? "لن تدفع أي مبلغ مسبقاً، الدفع عند فحص واستلام شحنتك."
                    : "No upfront charge. Pay only upon inspection."}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
