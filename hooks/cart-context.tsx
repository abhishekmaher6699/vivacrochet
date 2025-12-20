"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  cart: CartItem[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  getQty: (productId: string) => number;
  totalItems: number;
  loaded: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const storageKey = userId ? `cart_${userId}` : null;

  useEffect(() => {
    if (!userId) {
      setCart([]);
      setLoaded(true);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey!);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error("Failed to read cart", e);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    if (!loaded) return;
    if (!userId) return; 
    try {
      localStorage.setItem(storageKey!, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart, loaded, userId]);

  const add = (productId: string) => {
    if (!userId) return; 

    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const remove = (productId: string) => {
    if (!userId) return;

    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clear = () => {
    if (!userId) return;
    setCart([]);
  };

  const getQty = (productId: string) =>
    cart.find((i) => i.productId === productId)?.quantity ?? 0;

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, add, remove, clear, getQty, totalItems, loaded }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}