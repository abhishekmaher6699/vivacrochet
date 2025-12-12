"use client";

import { Button } from "../ui/button";
import { useCart } from "@/hooks/cart-context";


export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const { add, remove, getQty } = useCart();
  const qty = getQty(productId);

  if (qty === 0) {
    return (
      <Button className="rounded-none" disabled={stock <= 0} onClick={() => add(productId)}>
        Add to cart
      </Button>
    );
  }

  return (
    <div 
    className="flex items-center justify-between gap-4 border-2 border-black rounded-none"
         style={{ boxShadow: "2px 2px 0 0 rgba(0,0,0,0.9)" }}
    
    >
      <Button 
         className="bg-transparent border-none hover:bg-pink-400 rounded-none text-black text-xl" 
         onClick={() => remove(productId)}>−</Button>

      <span className="font-semibold text-lg text-center">
        {qty}
      </span>

      <Button className="bg-transparent border-none hover:bg-pink-400 rounded-none text-black text-xl" onClick={() => add(productId)} disabled={qty >= stock}>
        +
      </Button>
    </div>
  );
}
