"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type { Order, OrderItem, Product } from "@/lib/generated/prisma/client";

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;
const FALLBACK_IMG = "https://images.pexels.com/photos/19090/pexels-photo.jpg";
const CARD_SHADOW = "4px 4px 0 0 rgba(0,0,0,0.9)";

type OrderItemWithProduct = OrderItem & { product: Product | null };
type OrderWithItems = Order & { items: OrderItemWithProduct[] };

const OrderRow = React.memo(function OrderRow({ order }: { order: OrderWithItems }) {
  const itemCount = useMemo(() => order.items.reduce((s, it) => s + (it?.quantity ?? 0), 0), [order.items]);
  const createdAt = order.createdAt ? format(new Date(order.createdAt), "PPP p") : "";

  const firstImage = useMemo(() => {
    return order.items[0]?.product?.images?.length ? order.items[0]!.product!.images[0] : FALLBACK_IMG;
  }, [order.items]);

  return (
    <article
      key={order.id}
      className="flex flex-col md:flex-row items-start md:items-center justify-between md:gap-4 gap-2 border-2 border-black rounded-none p-4 bg-white"
      style={{ boxShadow: CARD_SHADOW }}
      aria-labelledby={`order-${order.id}-title`}
    >
      <div className="flex items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
        <img
          src={firstImage}
          alt={`Order ${order.id}`}
          className="w-16 h-16 md:w-20 md:h-20 object-contain border-2 border-black flex-shrink-0"
          loading="lazy"
        />

        <div className="min-w-0">
          <div className="text-sm text-gray-500">Order ID</div>
          <div id={`order-${order.id}-title`} className="font-mono font-semibold break-all text-sm md:text-base">
            {order.id}
          </div>
          <div className="text-sm text-gray-500 mt-1">{createdAt}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full md:w-auto">
        <div className="text-right sm:text-left w-full sm:w-auto">
          <div className="text-sm text-gray-500">Items</div>
          <div className="font-semibold">{itemCount}</div>
        </div>

        <div className="text-right w-full sm:w-auto">
          <div className="text-sm text-gray-500">Total</div>
          <div className="font-semibold">{rupee(order.totalAmount)}</div>
        </div>

        <div className="text-right w-full sm:w-auto">
          <div className="text-sm text-gray-500">Status</div>
          <div
            className={`font-semibold ${
              order.status === "PAID"
                ? "text-green-700"
                : order.status === "FAILED"
                ? "text-red-700"
                : "text-amber-700"
            }`}
          >
            {order.status}
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto">
        <Link
          href={`/orders/${order.id}`}
          className="inline-block px-3 py-2 border-2 border-black rounded-none font-semibold bg-pink-400 hover:opacity-90 w-full text-center md:w-auto"
        >
          View
        </Link>
      </div>
    </article>
  );
});
OrderRow.displayName = "OrderRow";

export default function OrdersHistory({ orders }: { orders: OrderWithItems[] }) {
  const rows = useMemo(() => (orders || []).map((o) => <OrderRow key={o.id} order={o} />), [orders]);

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 border-2 border-black rounded-none bg-[#fbfbfb]">
        <p className="text-gray-700">You have no past orders.</p>
        <Link href="/" className="inline-block mt-3 text-sm font-semibold underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return <div className="space-y-4">{rows}</div>;
}
