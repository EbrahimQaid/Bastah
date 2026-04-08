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
import { CheckCircle2 } from "lucide-react";

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
        <div className="p-6 text-center py-20 space-y-6">
          <div className="flex justify-center text-primary">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-bold">Order Received!</h1>
          <p className="text-muted-foreground">Thank you for your order. We will contact you shortly.</p>
          <Button onClick={() => setLocation(`/store/${storeSlug}`)} variant="outline" className="mt-8">
            Return to Store
          </Button>
        </div>
      </StoreLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StoreLayout storeSlug={storeSlug}>
        <div className="p-6 text-center py-20 space-y-4">
          <p>Your cart is empty.</p>
          <Button onClick={() => setLocation(`/store/${storeSlug}`)} variant="outline">
            Return to Store
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                required 
                value={form.customerName} 
                onChange={e => setForm({...form, customerName: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                required 
                type="tel"
                value={form.customerPhone} 
                onChange={e => setForm({...form, customerPhone: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address *</Label>
              <Textarea 
                id="address" 
                required 
                value={form.customerAddress} 
                onChange={e => setForm({...form, customerAddress: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="border-t pt-6 pb-6 space-y-2 bg-muted/20 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span>Items ({items.length})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </div>
    </StoreLayout>
  );
}