import { useRoute, useLocation } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ChevronLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function Checkout() {
  const [, params] = useRoute("/store/:storeSlug/checkout");
  const storeSlug = params?.storeSlug || "demo-store";
  const [, setLocation] = useLocation();
  
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    notes: ""
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.customerAddress) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    createOrder.mutate({
      storeSlug,
      data: {
        ...form,
        items
      }
    }, {
      onSuccess: () => {
        setSuccess(true);
        clearCart();
      },
      onError: () => {
        toast({ title: "Failed to place order", variant: "destructive" });
      }
    });
  };

  if (success) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="p-6 text-center py-32 space-y-8 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center text-primary bg-primary/10 p-6 rounded-full"
          >
            <CheckCircle2 className="w-20 h-20" />
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg">Thank you for your order. We'll be in touch soon.</p>
          </div>
          <Button onClick={() => setLocation(`/store/${storeSlug}`)} className="mt-8 rounded-full h-14 px-10 text-base font-bold">
            Continue Shopping
          </Button>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="p-6 text-center py-20 space-y-6">
          <p className="text-xl font-bold text-muted-foreground">Your cart is empty.</p>
          <Button onClick={() => setLocation(`/store/${storeSlug}`)} className="rounded-full h-12 px-8 font-bold">
            Return to Store
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="p-6 space-y-8 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
          <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-widest gap-1">
            <Lock className="w-3 h-3" /> Secure
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-border/50">
            <h2 className="font-bold text-lg border-b border-border/50 pb-4 mb-4">Contact Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Full Name *</Label>
              <Input 
                id="name" 
                required 
                className="h-12 rounded-xl bg-surface border-transparent focus-visible:ring-primary focus-visible:border-transparent text-base"
                value={form.customerName} 
                onChange={e => setForm({...form, customerName: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Phone Number *</Label>
              <Input 
                id="phone" 
                required 
                type="tel"
                className="h-12 rounded-xl bg-surface border-transparent focus-visible:ring-primary focus-visible:border-transparent text-base"
                value={form.customerPhone} 
                onChange={e => setForm({...form, customerPhone: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Delivery Address *</Label>
              <Textarea 
                id="address" 
                required 
                className="min-h-[100px] rounded-xl bg-surface border-transparent focus-visible:ring-primary focus-visible:border-transparent text-base resize-none"
                value={form.customerAddress} 
                onChange={e => setForm({...form, customerAddress: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Order Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                className="min-h-[80px] rounded-xl bg-surface border-transparent focus-visible:ring-primary focus-visible:border-transparent text-base resize-none"
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50">
            <h2 className="font-bold text-lg border-b border-border/50 pb-4 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <span className="bg-surface px-2 py-0.5 rounded text-xs text-muted-foreground font-bold">{item.quantity}x</span>
                    <span className="line-clamp-1">{item.productName}</span>
                  </div>
                  <span className="font-bold whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border/50 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-3 mt-3 border-t border-border/50 text-foreground">
                <span>Total</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" /> Place Order
              </>
            )}
          </Button>
        </form>
      </div>
    </StoreLayout>
  );
}