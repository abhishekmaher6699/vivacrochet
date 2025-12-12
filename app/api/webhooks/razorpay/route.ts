// app/api/webhooks/razorpay/route.ts
import { NextResponse } from "next/server";
import {  OrderStatus } from "@/lib/generated/prisma/client";
import crypto from "crypto";
import prisma from "@/lib/db";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(req: Request) {
  const body = await req.text(); // raw body required for signature verification
  const signature = req.headers.get("x-razorpay-signature") || "";

  // Verify webhook signature
  const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex");
  if (expected !== signature) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 400 });
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  // Example: handle payment.captured event
  try {
    const ev = data.event;
    if (ev === "payment.captured") {
      const payment = data.payload.payment.entity;
      // payment.order_id is razorpay_order_id, payment.id is payment id
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // Find DB order with receipt = order id (we used DB orderId as receipt)
      // NOTE: in our createRazorpayOrder we set receipt = dbOrderId, but Razorpay also returns order_id (razorpay) which we store in order.paymentId only after verify.
      // To map, you may have stored receipt in order. Here we look up by order.receipt -> but Prisma schema doesn't have receipt field.
      // If you used order.id as receipt and you also stored razorpay_order_id somewhere, adapt accordingly.
      // Easiest: find order by razorpay_order_id stored previously (if you saved it). If not, you can call Razorpay orders API to fetch receipt.
      // For example purposes, we'll try to find order by payment's receipt if set in notes/receipt.
      const receipt = payment.receipt; // may be null; depends on request
      if (receipt) {
        const order = await prisma.order.findUnique({ where: { id: receipt } });
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.PAID, paymentId: razorpayPaymentId },
          });
        }
      } else {
        // fallback: you might want to map razorpay_order_id to order (if you saved it earlier)
        // If you saved the razorpay_order_id on the order row, you can find by that
        const order = await prisma.order.findFirst({
          where: { paymentId: razorpayOrderId }, // only works if you stored it
        });
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.PAID, paymentId: razorpayPaymentId },
          });
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook handling error", err);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
