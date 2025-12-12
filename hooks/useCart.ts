"use client";

import { useEffect, useState } from "react";

export type CartItem = {
  productId: string;
  quantity: number;
};

const CART_KEY = "cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage (on first mount)
  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        setCart([]);
      }
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

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

  const clear = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
  };

  const getQty = (productId: string) =>
    cart.find((i) => i.productId === productId)?.quantity ?? 0;

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return { cart, add, remove, clear, getQty, totalItems };
}
