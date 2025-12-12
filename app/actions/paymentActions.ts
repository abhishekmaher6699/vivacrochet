// app/actions/paymentActions.ts
"use server";

import { OrderStatus } from "@/lib/generated/prisma/client";
import { auth } from "@/lib/auth";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export async function verifyRazorpayPayment(payload: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  orderId: string;
}) {
  const session = await requireAuth()
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = payload;

  // Verify signature: sha256_hmac(order_id + '|' + payment_id, secret)
  const generated = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated !== razorpay_signature) {
    throw new Error("Invalid signature");
  }

  // Mark order as PAID and save payment id
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PAID, paymentId: razorpay_payment_id },
  });

  return updated;
}
