import prisma from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth-utils";
import { format } from "date-fns";
import { unstable_cache } from "next/cache";

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;


const getAdminOrdersData = unstable_cache(
  async () => {
    console.log("db called")
    const [orders, stats] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),
    ]);

    return { orders, stats };
  },
  ["admin-orders-page"],     
  { revalidate: 30 }        
);

export default async function AdminOrdersPage() {
  await requireAdminAuth();

  const { orders, stats } = await getAdminOrdersData();
  let totalOrders = 0;
  let totalRevenue = 0;
  let paid = 0;
  let failed = 0;

  for (const s of stats) {
    totalOrders += s._count._all;
    totalRevenue += s._sum.totalAmount ?? 0;
    if (s.status === "PAID") paid = s._count._all;
    if (s.status === "FAILED") failed = s._count._all;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* ---------- STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Orders" value={totalOrders} />
        <Stat label="Revenue" value={rupee(totalRevenue)} />
        <Stat label="Paid" value={paid} />
        <Stat label="Failed" value={failed} />
      </div>

      {/* ---------- MOBILE CARDS ---------- */}
      <div className="space-y-4 md:hidden">
        {orders.map((o) => {
          const items = o.items.reduce((s, i) => s + i.quantity, 0);

          return (
            <div
              key={o.id}
              className="border rounded bg-white p-4"
            >
              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-semibold">{o.user?.name || "—"}</p>
                  <p className="text-xs text-gray-500">{o.user?.email}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="text-sm space-y-1">
                <Row label="Order ID" value={o.id} mono />
                <Row label="Items" value={items} />
                <Row label="Total" value={rupee(o.totalAmount)} />
                <Row
                  label="Placed"
                  value={format(o.createdAt, "PP p")}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block overflow-x-auto border rounded bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Placed</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const items = o.items.reduce(
                (s, i) => s + i.quantity,
                0
              );

              return (
                <tr key={o.id} className="border-b">
                  <td className="p-3">
                    <div className="font-semibold">{o.user?.name || "—"}</div>
                    <div className="text-xs text-gray-500">{o.user?.email}</div>
                  </td>
                  <td className="p-3 font-mono">{o.id}</td>
                  <td className="p-3">{items}</td>
                  <td className="p-3">{rupee(o.totalAmount)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3">
                    {format(o.createdAt, "PPP p")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-4 border rounded bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "px-2 py-1 rounded text-xs font-semibold";
  if (status === "PAID")
    return <span className={`${base} bg-green-100 text-green-700`}>PAID</span>;
  if (status === "FAILED")
    return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-700`}>{status}</span>;
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: any;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}
