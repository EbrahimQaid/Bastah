import { useRoute, useLocation, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { useCreateOrder } from "@workspace/api-client-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Lock, ArrowLeft, Package } from "lucide-react";
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
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { storeSlug, data: { ...form, items } },
      {
        onSuccess: () => { setSuccess(true); clearCart(); },
        onError: () => { toast({ title: "Failed to place order", variant: "destructive" }); },
      }
    );
  };

  /* ─── Success Screen ─── */
  if (success) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t.orderConfirmed}</h1>
            <p className="text-muted-foreground">{t.orderConfirmedDesc}</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            onClick={() => setLocation(`/store/${storeSlug}`)}
            className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
          >
            {t.continueShopping}
          </motion.button>
        </div>
      </StoreLayout>
    );
  }

  /* ─── Empty Cart ─── */
  if (items.length === 0) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-5">
          <Package className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-bold text-muted-foreground">{t.yourCartIsEmpty}</p>
          <Link href={`/store/${storeSlug}`}>
            <button className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all active:scale-[0.98]">
              {t.startShopping}
            </button>
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const inputCls = "w-full px-4 py-3 text-sm bg-surface border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium";

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="pb-28">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-border/40 px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Link href={`/store/${storeSlug}/cart`}>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <h1 className="text-base font-black tracking-tight">Checkout</h1>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <Lock className="w-3 h-3" /> Secure
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pt-5 space-y-5">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-4">
            <h2 className="font-black text-sm text-gray-900 uppercase tracking-wide text-muted-foreground">
              Contact Info
            </h2>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{t.name} *</label>
              <input
                required
                className={inputCls}
                placeholder={t.name}
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{t.phone} *</label>
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
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{t.address} *</label>
              <textarea
                required
                className={`${inputCls} min-h-[90px] resize-none`}
                placeholder={t.address}
                value={form.customerAddress}
                onChange={e => setForm({ ...form, customerAddress: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">{t.notes}</label>
              <textarea
                className={`${inputCls} min-h-[70px] resize-none`}
                placeholder={t.notes}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 space-y-4">
            <h2 className="font-black text-sm text-gray-900 uppercase tracking-wide text-muted-foreground">
              {t.orderSummary}
            </h2>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{item.productName}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                      {item.selectedSize && <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-muted-foreground font-bold">{item.selectedSize}</span>}
                      {item.selectedColor && <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-muted-foreground font-bold">{item.selectedColor}</span>}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-foreground whitespace-nowrap">{format(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/40 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t.subtotal}</span>
                <span>{format(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              <div className="flex justify-between font-black text-xl pt-3 border-t border-border/40">
                <span>{t.total}</span>
                <span className="text-primary">{format(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full h-14 text-base font-black rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {createOrder.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t.placeOrder}
              </>
            )}
          </button>
        </form>
      </div>
    </StoreLayout>
  );
}
