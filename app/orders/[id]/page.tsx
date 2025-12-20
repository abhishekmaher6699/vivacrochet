// app/orders/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { OrderStatus } from "@/lib/generated/prisma/client";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import Link from "next/link";

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;
const FALLBACK_IMG = "https://images.pexels.com/photos/19090/pexels-photo.jpg";
const CARD_SHADOW =
  "4px 4px 0 0 rgba(0,0,0,0.9), inset 2px 2px 0 rgba(0,0,0,0.06)";
const SUMMARY_SHADOW = "2px 2px 0 0 rgba(0,0,0,0.9)";

type Params = {
  params: {
    id: string;
  };
};

export default async function OrderPage({ params }: Params) {
  const orderId = (await params).id;

  // Require auth up-front. If no session, show a simple unauthorized UI.
  const session = await requireAuth();
  const userId = session?.user?.id;
  if (!userId) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Unauthorized</h1>
        <p>Please sign in to view your order.</p>
      </div>
    );
  }

  // Fetch only the fields we need and ensure the order belongs to this user.
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      totalAmount: true,
      paymentId: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          // include minimal product fields used in UI:
          product: { select: { id: true, title: true, images: true } },
        },
      },
    },
  });

  // If no order found (either missing or not owned) -> 404
  if (!order) return notFound();

  const createdAt = order.createdAt ? format(order.createdAt, "PPP p") : "";
  const itemsCount = order.items.reduce((s, it) => s + (it?.quantity ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="mb-4">
          <Link
            href="/history"
            className="inline-block px-4 py-2 border-2 border-black bg-white font-semibold text-sm rounded-none 
            hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 transition-transform hover:bg-pink-400 hover:text-white"
          >
            ←  Back to Orders
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed</h1>
        <p className="text-sm text-gray-600 mt-1">
          Order ID: <span className="font-mono">{order.id}</span>
        </p>
        <p className="text-sm text-gray-600">Placed on {createdAt}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="md:col-span-2 space-y-4">
          {order.items.map((item) => {
            const product = item.product;
            const img =
              product?.images && product.images.length > 0
                ? product.images[0]
                : FALLBACK_IMG;

            return (
              <div
                key={item.id}
                className="flex gap-3 border-2 border-black rounded-none p-3 bg-[#fbfbfb]"
                style={{ boxShadow: CARD_SHADOW }}
              >
                <img
                  src={img}
                  alt={product?.title ?? "Product"}
                  className="w-20 h-20 object-cover border-2 border-black"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {product?.title ?? "Product"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Unit price:{" "}
                    <span className="font-semibold">
                      {rupee(item.unitPrice)}
                    </span>
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      Quantity:{" "}
                      <span className="font-semibold">{item.quantity}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-500">Subtotal</div>
                      <div className="font-semibold">
                        {rupee(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="md:col-span-1">
          <div
            className="border-2 border-black rounded-none p-4 bg-white"
            style={{ boxShadow: SUMMARY_SHADOW }}
          >
            <h4 className="text-lg font-semibold mb-2">Order summary</h4>

            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Items</span>
              <span>{itemsCount}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Subtotal</span>
              <span>{rupee(order.totalAmount)}</span>
            </div>

            <div className="mb-3">
              <div className="text-xs text-gray-500">Payment</div>
              <div className="font-semibold">{order.paymentId ?? "—"}</div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-gray-500">Status</div>
              <div
                className={`font-semibold ${
                  order.status === OrderStatus.PAID
                    ? "text-green-700"
                    : order.status === OrderStatus.FAILED
                    ? "text-red-700"
                    : "text-amber-700"
                }`}
              >
                {order.status}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div>Customer</div>
              <div className="font-semibold">
                {order.user?.name ?? order.user?.email ?? "—"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}