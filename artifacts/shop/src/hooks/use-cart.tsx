import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { OrderItem } from "@workspace/api-client-react";

interface CartContextType {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (productId: number, selectedSize?: string | null, selectedColor?: string | null) => void;
  updateQuantity: (productId: number, quantity: number, selectedSize?: string | null, selectedColor?: string | null) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: OrderItem) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        i => i.productId === newItem.productId &&
             i.selectedSize === newItem.selectedSize &&
             i.selectedColor === newItem.selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...current];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...current, newItem];
    });
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

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
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
