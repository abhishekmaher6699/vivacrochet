import prisma from "@/lib/db";
import { requireAdminAuth } from "@/lib/auth-utils";
import { format } from "date-fns";

const rupee = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

export default async function AdminOrdersPage() {
  await requireAdminAuth();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: true,
    },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const paidOrders = orders.filter((o) => o.status === "PAID").length;
  const failedOrders = orders.filter((o) => o.status === "FAILED").length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      {/* -------- STATS -------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Orders" value={totalOrders} />
        <StatCard label="Revenue" value={rupee(totalRevenue)} />
        <StatCard label="Paid" value={paidOrders} />
        <StatCard label="Failed" value={failedOrders} />
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="space-y-4 md:hidden">
        {orders.map((o) => {
          const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);

          return (
            <div
              key={o.id}
              className="border rounded bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">
                    {o.user?.name || "—"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {o.user?.email}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>

              <div className="text-sm space-y-1">
                <Row label="Order ID" value={o.id} mono />
                <Row label="Items" value={itemCount} />
                <Row label="Total" value={rupee(o.totalAmount)} />
                <Row
                  label="Placed"
                  value={
                    o.createdAt
                      ? format(o.createdAt, "PP p")
                      : "—"
                  }
                />
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <p className="text-center text-gray-500">No orders found</p>
        )}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-auto border rounded bg-white">
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
              const itemCount = o.items.reduce(
                (s, i) => s + i.quantity,
                0
              );

              return (
                <tr key={o.id} className="border-b">
                  <td className="p-3">
                    <div className="font-semibold">
                      {o.user?.name || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {o.user?.email}
                    </div>
                  </td>
                  <td className="p-3 font-mono">{o.id}</td>
                  <td className="p-3">{itemCount}</td>
                  <td className="p-3">{rupee(o.totalAmount)}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3">
                    {o.createdAt
                      ? format(o.createdAt, "PPP p")
                      : "—"}
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------ */
/* UI Helpers         */
/* ------------------ */

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-4 border rounded bg-white">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "px-2 py-1 rounded text-xs font-semibold";

  if (status === "PAID")
    return <span className={`${base} bg-green-100 text-green-700`}>PAID</span>;

  if (status === "FAILED")
    return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;

  return (
    <span className={`${base} bg-yellow-100 text-yellow-700`}>
      {status}
    </span>
  );
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
