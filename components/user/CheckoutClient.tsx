"use client";

// import Image from "next/image";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/cart-context";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/generated/prisma/client";
import {
  createRazorpayOrder,
  restoreStockForOrder,
} from "@/app/actions/orderActions";
import { verifyRazorpayPayment } from "@/app/actions/paymentActions";
import next from "next";
import { ConfirmDialog } from "../confirmPopup";

// Cache the Razorpay script load promise at module scope so subsequent calls reuse it.
let _razorpayLoader: Promise<void> | null = null;

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

type CheckoutClientProps = {
  products: Product[];
};

// Small memoized line item so each row doesn't re-render when unrelated state changes.
const LineItem = ({
  product,
  quantity,
  onAdd,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const img = product.images[0];

  return (
    <div
      key={product.id}
      className="flex gap-2 border-2 border-black rounded-none p-3 bg-[#fbfbfb]"
      style={{
        boxShadow:
          "4px 4px 0 0 rgba(0,0,0,0.9), inset 2px 2px 0 rgba(0,0,0,0.06)",
      }}
    >
      {/* Use next/image for automatic optimizations and lazy loading */}
      <div className="w-24 h-24 relative">
        <Image
          src={img}
          alt={product.title}
          fill
          unoptimized
          className="object-cover rounded-none border-2 border-black"
          sizes="96px"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="font-semibold text-lg">{product.title}</h2>
          <p className="text-sm text-gray-600">Price: {rupee(product.price)}</p>
        </div>

        <div className="flex items-center md:h-8 h-7 justify-between mt-2">
          <div className="flex items-center gap-1 border-2 border-black rounded-none">
            <Button
              type="button"
              onClick={() => onRemove(product.id)}
              className="md:h-8 md:w-8 h-7 w-5 bg-transparent border-none text-black text-xl hover:bg-pink-400 rounded-none"
            >
              −
            </Button>

            <span className="md:w-6 md:h-5 h-6 text-center font-semibold">
              {quantity}
            </span>

            <Button
              type="button"
              onClick={() => onAdd(product.id)}
              className="md:h-8 md:w-8 h-7 w-5 bg-transparent border-none text-black text-xl hover:bg-pink-400 rounded-none"
            >
              +
            </Button>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Subtotal</div>
            <div className="md:font-semibold text-sm">
              {rupee(product.price * quantity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutClient({ products }: CheckoutClientProps) {
    const router = useRouter();
    const { cart, add, remove, clear } = useCart();
    const [processing, setProcessing] = useState(false);

    const { lines, total } = useMemo(() => {
    const linesAcc: { product: Product; quantity: number }[] = [];
    let totalAcc = 0;

    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      linesAcc.push({ product, quantity: item.quantity });
      totalAcc += product.price * item.quantity;
    }

    return { lines: linesAcc, total: totalAcc };
  }, [cart, products]);

  const loadRazorpayScript = useCallback(() => {
    if (typeof window === "undefined")
      return Promise.reject(new Error("No window"));
    if ((window as any).Razorpay) return Promise.resolve();
    if (_razorpayLoader) return _razorpayLoader;

    _razorpayLoader = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.head.appendChild(s);
    });

    return _razorpayLoader;
  }, []);

  const handleAdd = useCallback((id: string) => add(id), [add]);
  const handleRemove = useCallback((id: string) => remove(id), [remove]);

  const handleBuyAll = useCallback(async () => {
    if (!cart || cart.length === 0) return;

    setProcessing(true);

    try {
      const { orderId, razorpayOrder, keyId } = await createRazorpayOrder(cart);

      await loadRazorpayScript();

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "VivaCrochet",
        description: "Order " + orderId,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            await verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            router.push(`/orders/${orderId}`);
            setTimeout(clear, 3000);
          } catch (err) {
            await restoreStockForOrder(orderId);
            console.error("Verification failed:", err);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
        prefill: { name: "" },
        theme: { color: "#F472B6" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      alert("Failed to initiate payment: " + (err?.message ?? err));
      setProcessing(false);
    }
  }, [cart, clear, loadRazorpayScript, router]);

  if (!lines.length) {
    return (
      <div className="p-4">
        <p className="mb-4">Your cart is empty.</p>
        <Button onClick={() => router.push("/products")}>
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {lines.map(({ product, quantity }) => (
            <LineItem
              key={product.id}
              product={product}
              quantity={quantity}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div className="md:col-span-1">
          <div
            className="border-2 border-black rounded-none p-4 bg-white sticky top-24"
            style={{ boxShadow: "2px 2px 0 0 rgba(0,0,0,0.9)" }}
            aria-busy={processing}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-xl font-bold">{rupee(total)}</span>
            </div>

            <ConfirmDialog
              title="Buy?"
              description="Are you sure?"
              confirmLabel="Buy"
              destructive
              onConfirm={handleBuyAll}
              trigger={
                <Button
                  disabled={total === 0 || processing}
                  variant="elevated"
                  className="w-full h-11 rounded-none text-sm font-semibold bg-pink-400 disabled:opacity-60"
                >
                  {processing ? "Processing…" : "Buy all"}
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
