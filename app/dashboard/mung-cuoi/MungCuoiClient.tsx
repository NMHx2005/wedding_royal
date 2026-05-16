"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { GiftLogRow } from "@/types";
import { deleteGiftLog, insertGiftLog } from "@/app/actions/wishes-gifts";
import { formatVnd } from "@/lib/utils";

type Props = { cardId: string; logs: GiftLogRow[] };

export function MungCuoiClient({ cardId, logs: initial }: Props) {
  const [logs, setLogs] = useState(initial);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const total = useMemo(() => logs.reduce((a, r) => a + (r.amount ?? 0), 0), [logs]);

  const exportXlsx = () => {
    const sheet = XLSX.utils.json_to_sheet(
      logs.map((r) => ({
        guest: r.guest_name,
        amount: r.amount,
        note: r.note,
        time: r.created_at,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Mung cuoi");
    XLSX.writeFile(wb, "mung-cuoi.xlsx");
    toast.success("Đã xuất Excel");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bản ghi mừng cưới này?")) return;
    setDeletingId(id);
    const { error } = await deleteGiftLog(id);
    setDeletingId(null);
    if (error) toast.error(error);
    else {
      setLogs((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã xóa");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mừng cưới</h1>
      <p className="text-sm text-neutral-500">Theo dõi quà mừng cưới và xuất báo cáo cho đám cưới của bạn.</p>
      <div className="rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-neutral-600">Tổng số tiền</p>
        <p className="mt-2 text-3xl font-bold text-mewedding-rose">{formatVnd(total)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportXlsx} className="rounded-lg border px-3 py-2 text-sm">
          Export Excel
        </button>
      </div>
      <div className="rounded-xl border border-neutral-100 bg-white p-4">
        <h2 className="font-medium">Thêm thủ công</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Tên" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Số tiền (VND)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg bg-mewedding-rose px-4 py-2 text-sm text-white"
          onClick={async () => {
            const n = Number(amount.replace(/\D/g, ""));
            const { error } = await insertGiftLog(cardId, {
              guest_name: name || null,
              amount: Number.isFinite(n) ? n : null,
              note: note || null,
            });
            if (error) toast.error(error);
            else {
              toast.success("Đã thêm");
              window.location.reload();
            }
          }}
        >
          Thêm
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="p-3">Tên</th>
              <th className="p-3">Số tiền</th>
              <th className="p-3">Ghi chú</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {logs.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.guest_name ?? "—"}</td>
                <td className="p-3">{r.amount != null ? formatVnd(r.amount) : "—"}</td>
                <td className="p-3">{r.note ?? "—"}</td>
                <td className="p-3 text-xs text-neutral-600">{new Date(r.created_at).toLocaleString("vi-VN")}</td>
                <td className="p-3">
                  <button
                    type="button"
                    disabled={deletingId === r.id}
                    onClick={() => void handleDelete(r.id)}
                    className="text-xs text-red-500 hover:underline disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
