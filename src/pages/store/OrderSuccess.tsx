import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStore } from "@/services/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { CheckCircle2, ShoppingBag, MessageCircle, ArrowRight, ShieldCheck, Printer } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const [, params] = useRoute("/store/order-success/:orderId");
  const orderId = params?.orderId || "";
  const { data: store } = useGetStore();
  const { isRTL } = useLanguage();
  const { format } = useCurrency();

  // Retrieve secure session receipt (only available to the customer who just completed checkout)
  const sessionReceiptRaw = typeof window !== "undefined"
    ? sessionStorage.getItem(`dukkani_receipt_${orderId}`)
    : null;
  const receipt = sessionReceiptRaw ? JSON.parse(sessionReceiptRaw) : null;

  const whatsappNumber = store?.whatsappNumber?.replace(/\D/g, "");
  const trackWhatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        isRTL
          ? `مرحباً، أود متابعة حالة طلبي رقم #${orderId}${receipt?.customerName ? ` باسم ${receipt.customerName}` : ""}.`
          : `Hello, I would like to track my order #${orderId}.`
      )}`
    : null;

  return (
    <StoreLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Top Celebration */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 shadow-xs"
          >
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </motion.div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300">
            {isRTL ? `رقم الطلب #${orderId}` : `Order #${orderId}`}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            {isRTL ? "تم استلام طلبك بنجاح!" : "Order Confirmed!"}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            {receipt?.customerName
              ? isRTL
                ? `شكراً لتسوقك معنا يا ${receipt.customerName}! سيتم تجهيز طلبك والتواصل معك لتأكيد التوصيل.`
                : `Thank you for your purchase, ${receipt.customerName}! We are preparing your order.`
              : isRTL
              ? "تم إرسال تفاصيل طلبك إلى إدارة المتجر وسيتم تجهيز الشحنة والتواصل معك."
              : "Your order details have been submitted and are being processed."}
          </p>
        </div>

        {/* Invoice Summary Card */}
        {receipt ? (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-zinc-800">
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  {isRTL ? "تفاصيل الفاتورة" : "Order Receipt"}
                </h2>
                <p className="text-[11px] text-neutral-400">
                  {isRTL ? "الدفع عند الاستلام (COD)" : "Cash on Delivery"}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isRTL ? "طباعة الفاتورة" : "Print"}</span>
              </button>
            </div>

            {/* Itemized List */}
            <div className="divide-y divide-neutral-100 dark:divide-zinc-800 text-xs">
              {receipt.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-zinc-700">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {item.selectedSize && `${item.selectedSize} · `}
                        {item.selectedColor && `${item.selectedColor} · `}
                        <span>× {item.quantity}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {format(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-neutral-100 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>{isRTL ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-mono">{format(receipt.subtotal || receipt.total)}</span>
              </div>
              {Number(receipt.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>
                    {isRTL ? "قيمة الخصم" : "Discount"}
                    {receipt.couponCode && ` (${receipt.couponCode})`}
                  </span>
                  <span className="font-mono">-{format(Number(receipt.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>{isRTL ? "رسوم الشحن" : "Shipping"}</span>
                <span className="font-mono">
                  {receipt.shippingAmount ? format(receipt.shippingAmount) : isRTL ? "مجاني" : "Free"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-zinc-800">
                <span>{isRTL ? "الإجمالي الكلي" : "Total Amount"}</span>
                <span className="font-mono text-base text-red-600">{format(receipt.total)}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Privacy-preserving state for direct URL visits without active session */
          <div className="bg-neutral-50 dark:bg-zinc-900/60 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-xs font-bold text-neutral-800 dark:text-zinc-200">
              {isRTL ? "حماية خصوصية بيانات الطلب" : "Order Privacy Protection"}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {isRTL
                ? "لأسباب أمنية وحمايةً لخصوصية العميل، تتوفر تفاصيل الفاتورة مباشرة بعد إتمام الشراء. يمكنك متابعة حالة طلبك باستخدام رقم الطلب أعلاه مع خدمة العملاء."
                : "For security and privacy, full receipt details are only visible during the checkout session. Please quote your order number to customer support."}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {trackWhatsappUrl && (
            <a
              href={trackWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isRTL ? "متابعة الطلب عبر واتساب" : "Track via WhatsApp"}</span>
            </a>
          )}

          <Link href="/store">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>{isRTL ? "مواصلة التسوق" : "Continue Shopping"}</span>
            </button>
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}
