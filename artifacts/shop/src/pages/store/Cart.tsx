import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function Cart() {
  const [, params] = useRoute("/store/:storeSlug/cart");
  const storeSlug = params?.storeSlug || "demo-store";
  
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground space-y-4">
            <p>Your cart is empty.</p>
            <Link href={`/store/${storeSlug}/products`}>
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    <div className="text-sm text-muted-foreground flex gap-2">
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button 
                      onClick={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
                      className="text-destructive p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 bg-background border rounded-md p-1 mt-2">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize, item.selectedColor)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize, item.selectedColor)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <Link href={`/store/${storeSlug}/checkout`}>
                <Button className="w-full h-12 text-lg">Proceed to Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
}