"use client";

import { CartProvider } from "@/hooks/cart-context";

export function Providers({ children, userId }: { children: React.ReactNode, userId: string }) {
  return <CartProvider userId={userId}>{children}</CartProvider>;
}
