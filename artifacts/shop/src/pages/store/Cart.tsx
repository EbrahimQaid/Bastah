import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const [, params] = useRoute("/store/:storeSlug/cart");
  const storeSlug = params?.storeSlug || "demo-store";

  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const { format } = useCurrency();
  const { t } = useLanguage();

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col min-h-full pb-24">
        <div className="p-5">
          <h1 className="text-2xl font-bold mb-6 tracking-tight">{t.cart}</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-muted-foreground border border-border">
                <ShoppingBag className="w-12 h-12 opacity-40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{t.yourCartIsEmpty}</h3>
                <p className="text-muted-foreground max-w-[250px] mx-auto text-sm">
                  {t.startShopping}
                </p>
              </div>
              <Link href={`/store/${storeSlug}/products`}>
                <Button className="rounded-full px-8 h-12 text-sm font-bold bg-primary hover:bg-primary/90 text-white mt-2">
                  {t.startShopping}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-3 p-3 bg-white rounded-2xl shadow-sm border border-border/40 relative overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="w-[88px] h-[100px] bg-surface rounded-xl flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5 pr-8">
                      <div>
                        <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2">
                          {item.productName}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.selectedSize && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-muted-foreground uppercase tracking-wide border border-border/50">
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-muted-foreground uppercase tracking-wide border border-border/50">
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <p className="font-bold text-primary text-base">{format(item.price * item.quantity)}</p>

                        <div className="flex items-center gap-2 bg-surface rounded-full p-0.5 border border-border/50">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-foreground shadow-sm transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-foreground shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                      className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors p-1.5 bg-surface rounded-full border border-border/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-surface rounded-2xl p-5 space-y-3 border border-border/40">
                <h3 className="font-bold text-base mb-1">{t.orderSummary}</h3>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t.subtotal} ({items.reduce((s, i) => s + i.quantity, 0)} {t.quantity})</span>
                  <span>{format(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t border-border pt-3 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{t.total}</span>
                    <span className="font-bold text-2xl text-foreground">{format(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href={`/store/${storeSlug}/checkout`} className="block pb-4">
                <Button className="w-full h-14 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center group">
                  {t.proceedToCheckout}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}
