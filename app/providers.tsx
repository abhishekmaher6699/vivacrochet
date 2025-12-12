"use client";

import { CartProvider } from "@/hooks/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
