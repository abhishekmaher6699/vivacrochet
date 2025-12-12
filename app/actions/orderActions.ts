// app/actions/orderActions.ts
"use server";

import { OrderStatus } from "@/lib/generated/prisma/client";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn("Missing Razorpay env vars RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET");
}

type CartItem = { productId: string; quantity: number };

export async function createRazorpayOrder(items: CartItem[]) {
  const session = await requireAuth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  if (!items || items.length === 0) throw new Error("Cart is empty");

  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
  });

  let totalAmount = 0;
  const lineItems = items.map((it) => {
    const prod = products.find((p) => p.id === it.productId);
    if (!prod) throw new Error(`Product not found: ${it.productId}`);
    const qty = Math.max(1, Math.floor(it.quantity));
    totalAmount += prod.price * qty;
    return {
      productId: prod.id,
      quantity: qty,
      unitPrice: prod.price,
    };
  });

  if (totalAmount <= 0) throw new Error("Invalid total amount");

  const order = await prisma.$transaction(async (tx) => {
    for (const it of lineItems) {
      const res = await tx.product.updateMany({
        where: {
          id: it.productId,
          stock: { gte: it.quantity }, // ensure enough stock
        },
        data: {
          stock: { decrement: it.quantity },
        },
      });

      if (res.count === 0) {
        // Not enough stock for this product — abort with a helpful message
        throw new Error(`Insufficient stock for product ${it.productId}`);
      }
    }
    const createdOrder = await tx.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        currency: "INR",
      },
    });

    // create items
    await Promise.all(
      lineItems.map((li) =>
        tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: li.productId,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          },
        })
      )
    );

    return createdOrder;
  });

  // 3) Create Razorpay order via REST API
  const payload = {
    amount: totalAmount, // paise
    currency: "INR",
    receipt: order.id, // use DB order id as receipt
    payment_capture: 1,
  };

  const basicAuth = Buffer.from(
    `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    // Optionally mark DB order as FAILED here
    throw new Error("Failed to create Razorpay order: " + text);
  }

  const razorpayOrder = await res.json();

  return { orderId: order.id, razorpayOrder, keyId: RAZORPAY_KEY_ID };
}

export async function restoreStockForOrder(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  await prisma.$transaction(
    items.map((it) =>
      prisma.product.update({
        where: { id: it.productId },
        data: { stock: { increment: it.quantity } },
      })
    )
  );
}