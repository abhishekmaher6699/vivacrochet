"use client";

import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import type { ProductValues } from "../admin/ProductForm";
import { useCart } from "@/hooks/cart-context";

const AddToCartButton = dynamic(() => import("./AddToCartBtn"), { ssr: false });

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

const CARD_SHADOW = "4px 4px 0 0 rgba(0,0,0,0.9), -4px -4px 0 0 rgba(255,255,255,0.8), inset 2px 2px 0 rgba(0,0,0,0.06)";
const IMG_SHADOW = "4px 4px 0 0 rgba(0,0,0,0.9), inset 2px 2px 0 rgba(255,255,255,0.6)";
const FALLBACK_IMG = "https://images.pexels.com/photos/19090/pexels-photo.jpg";

type Props = { products: any };

const ProductItem = React.memo(function ProductItem({
  product,
  onBuyNow,
}: {
  product: any;
  onBuyNow: (p: ProductValues) => void;
}) {
  const img = product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMG;
  const outOfStock = product.stock <= 0;

  const { add, getQty } = useCart();

  const handleBuyNow = useCallback(() => {
    console.log("In side handle buy")
    try {
      const qty = getQty(product.id);
      console.log(qty)
      if (qty === 0 && !outOfStock) {
        add(product.id);
      }
    } catch (e) {
      console.error("Cart add failed", e);
    }

    onBuyNow(product);
  }, [product, getQty, add, onBuyNow, outOfStock]);

  return (
    <article
      key={product.id}
      className="relative bg-[#fbfbfb] border-4 border-black rounded-none p-4 flex flex-col"
      style={{ boxShadow: CARD_SHADOW }}
      aria-labelledby={`product-${product.id}-title`}
    >
      {/* image */}
      <div
        className="rounded-none overflow-hidden mb-2 shrink-0 cursor-pointer"
        style={{ boxShadow: IMG_SHADOW }}
      >
        <img src={img} alt={product.title} className="w-full h-50 object-contain block" loading="lazy" />
      </div>

      <div className="flex-1">
        <h2 id={`product-${product.id}-title`} className="text-lg font-bold tracking-tight mb-1">
          {product.title}
        </h2>

        {product.description ? (
          <p className="text-sm text-gray-700 mb-2 md:mb-3 line-clamp-3">{product.description}</p>
        ) : null}
      </div>

      <div>
        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="text-lg font-semibold">{rupee(product.price)}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Stock</div>
            <div
              className={`text-sm font-medium ${
                product.stock > 10 ? "text-green-700" : product.stock > 0 ? "text-amber-700" : "text-red-700"
              }`}
            >
              {outOfStock ? "Out of stock" : `${product.stock} ${product.stock === 1 ? "unit" : "units"}`}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <div className="flex-1">
            <AddToCartButton productId={product.id} stock={product.stock} />
          </div>

          <Button
            disabled={outOfStock}
            onClick={handleBuyNow}
            variant="outline"
            className="flex-1 py-2 px-3 rounded-none text-sm font-semibold border-2 border-black bg-white hover:translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ boxShadow: "2px 2px 0 0 rgba(0,0,0,0.9)" }}
          >
            Buy now
          </Button>
        </div>
      </div>
    </article>
  );
});

export default function UserProductCard({ products }: Props) {
  const router = useRouter();

  const handleBuyNow = useCallback((product: ProductValues) => {
    router.push(`/checkout`);
  }, [router]);

  const content = useMemo(() => {
    return products.map((product) => (
      <ProductItem key={product.id} product={product} onBuyNow={handleBuyNow} />
    ));
  }, [products, handleBuyNow]);

  return <div className=""> <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">{content}</div></div>;
}