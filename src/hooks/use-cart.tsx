import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { OrderItem } from "@/services/api";

export interface CartItem extends OrderItem {
  imageUrl?: string;
}

export interface AppliedCoupon {
  code: string;
  percent: number;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, selectedSize?: string | null, selectedColor?: string | null) => void;
  updateQuantity: (productId: number, quantity: number, selectedSize?: string | null, selectedColor?: string | null) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
  miniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem("cart_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [miniCartOpen, setMiniCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("cart_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("cart_coupon");
    }
  }, [appliedCoupon]);

  const addItem = (newItem: CartItem) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        i => i.productId === newItem.productId &&
             i.selectedSize === newItem.selectedSize &&
             i.selectedColor === newItem.selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + newItem.quantity };
        return updated;
      }
      return [...current, newItem];
    });
    setMiniCartOpen(true);
  };

  const removeItem = (productId: number, selectedSize?: string | null, selectedColor?: string | null) => {
    setItems(current => current.filter(
      i => !(i.productId === productId && i.selectedSize === selectedSize && i.selectedColor === selectedColor)
    ));
  };

  const updateQuantity = (productId: number, quantity: number, selectedSize?: string | null, selectedColor?: string | null) => {
    if (quantity <= 0) {
      removeItem(productId, selectedSize, selectedColor);
      return;
    }
    setItems(current => current.map(i => {
      if (i.productId === productId && i.selectedSize === selectedSize && i.selectedColor === selectedColor) {
        return { ...i, quantity };
      }
      return i;
    }));
  };

  const applyCoupon = (coupon: AppliedCoupon) => setAppliedCoupon(coupon);
  const removeCoupon = () => setAppliedCoupon(null);

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };
  const openMiniCart = () => setMiniCartOpen(true);
  const closeMiniCart = () => setMiniCartOpen(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? Math.round(totalPrice * (appliedCoupon.percent / 100) * 100) / 100 : 0;
  const finalTotal = Math.max(0, totalPrice - discountAmount);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      discountAmount,
      finalTotal,
      miniCartOpen,
      openMiniCart,
      closeMiniCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
