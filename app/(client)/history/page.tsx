// app/orders/page.tsx
import dynamic from "next/dynamic";
import { Suspense } from "react";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { LoadingScreen } from "@/components/LoadingScreen"

const OrdersHistory = dynamic(() => import("@/components/user/OrdersHistory"), { suspense: true });


export default async function OrdersPage() {
  const session = await requireAuth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Your orders</h1>
        <p>Please sign in to view your order history.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          product: { select: { id: true, title: true, images: true } },
        },
      },
    },
  });

  return (
    <div>
      <Suspense fallback={<LoadingScreen />}>
        <div className="max-w-5xl mx-auto md:p-6">
          <h1 className="text-2xl font-bold mb-6">Order history</h1>
          <OrdersHistory orders={orders} />
        </div>
      </Suspense>
    </div>
  );
}
