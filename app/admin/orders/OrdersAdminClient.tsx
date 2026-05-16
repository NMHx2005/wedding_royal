"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { OrderRow } from "@/types";

type OrderWithProfile = OrderRow & { profiles: { full_name: string | null } | null };

type Props = { orders: OrderWithProfile[] };

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function OrdersAdminClient({ orders: initial }: Props) {
  const [orders, setOrders] = useState(initial);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() =>
    orders.filter((o) =>
      (statusFilter === "all" || o.status === statusFilter) &&
      (typeFilter === "all" || o.order_type === typeFilter)
    ),
    [orders, statusFilter, typeFilter]
  );

  const updateStatus = async (id: string, status: "paid" | "cancelled") => {
    setLoading(id);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Lỗi");
    else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status, paid_at: status === "paid" ? new Date().toISOString() : o.paid_at }
            : o
        )
      );
      toast.success(status === "paid" ? "Đã duyệt đơn hàng" : "Đã từ chối đơn hàng");
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng</h1>
          <p className="text-sm text-neutral-500">{orders.length} đơn hàng</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border bg-white px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="rounded-lg border bg-white px-3 py-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tất cả loại</option>
            <option value="plan">Plan</option>
            <option value="features">Features</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Loại</th>
              <th className="px-4 py-3 text-left">Số tiền</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{o.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-neutral-700">{o.profiles?.full_name || o.user_id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.order_type === "features" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {o.order_type === "features" ? `Tính năng (${o.feature_keys?.length ?? 0})` : `Plan: ${o.plan}`}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-rose-600">{fmt(Number(o.amount))}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[o.status as keyof typeof STATUS_COLORS] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3">
                  {o.status === "pending" && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateStatus(o.id, "paid")} disabled={loading === o.id} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">
                        Duyệt
                      </button>
                      <button onClick={() => updateStatus(o.id, "cancelled")} disabled={loading === o.id} className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                        Từ chối
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400">
                  Không có đơn hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
