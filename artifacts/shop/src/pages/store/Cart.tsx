import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Cart() {
  const [, params] = useRoute("/store/:storeSlug/cart");
  const storeSlug = params?.storeSlug || "demo-store";
  
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col min-h-full pb-24">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 tracking-tight">Shopping Bag</h1>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Your bag is empty</h3>
                <p className="text-muted-foreground max-w-[250px] mx-auto">Looks like you haven't added anything to your bag yet.</p>
              </div>
              <Link href={`/store/${storeSlug}/products`}>
                <Button className="rounded-full px-8 h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white mt-4">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 relative"
                  >
                    {/* Trash Button */}
                    <button 
                      onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors p-1.5 bg-surface rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="w-20 h-24 bg-surface rounded-xl flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted/30" />
                      {/* Product image would go here if available in Cart context */}
                    </div>

                    <div className="flex-1 flex flex-col justify-between pr-8">
                      <div>
                        <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2">{item.productName}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.selectedSize && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-surface text-muted-foreground uppercase">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-surface text-muted-foreground uppercase">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <p className="font-bold text-primary text-base">${(item.price).toFixed(2)}</p>
                        
                        <div className="flex items-center gap-3 bg-surface rounded-full p-1 border border-border/50">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-foreground shadow-sm transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-full text-foreground shadow-sm transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-surface rounded-2xl p-6 space-y-4 border border-border/50">
                <h3 className="font-bold text-lg mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-4 mt-2">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-foreground">Estimated Total</span>
                    <span className="font-bold text-2xl text-foreground">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Link href={`/store/${storeSlug}/checkout`} className="block pb-8">
                <Button className="w-full h-14 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center group">
                  Proceed to Checkout
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