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

const CART_KEY = "cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 1) Load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to read cart from localStorage", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // 2) Save to localStorage whenever cart changes (after initial load)
  useEffect(() => {
    if (!loaded) return; // don't overwrite before initial load
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart, loaded]);

  const add = (productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const remove = (productId: string) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clear = () => setCart([]);

  const getQty = (productId: string) =>
    cart.find((i) => i.productId === productId)?.quantity ?? 0;

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const value: CartContextValue = {
    cart,
    add,
    remove,
    clear,
    getQty,
    totalItems,
    loaded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
