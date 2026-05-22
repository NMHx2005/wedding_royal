"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCheck, Crown, Download, Trash2, X } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import type { Plan, WishRow } from "@/types";
import { deleteWish, setWishApproved } from "@/app/actions/wishes-gifts";

const PAGE_SIZES = [10, 20, 50] as const;

type Props = { wishes: WishRow[]; plan: Plan; showUpsell?: boolean; canExportWishes?: boolean };

export function LoiChucClient({
  wishes: initial,
  showUpsell = false,
  canExportWishes = false,
}: Props) {
  const confirmDialog = useConfirm();
  const [wishes, setWishes] = useState(initial);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [filterApproved, setFilterApproved] = useState<"all" | "approved" | "pending">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const filtered = useMemo(() => {
    return wishes
      .filter((w) => {
        const matchQ =
          w.guest_name.toLowerCase().includes(q.toLowerCase()) ||
          w.message.toLowerCase().includes(q.toLowerCase());
        const matchApproved =
          filterApproved === "all" ||
          (filterApproved === "approved" && w.is_approved) ||
          (filterApproved === "pending" && !w.is_approved);
        return matchQ && matchApproved;
      })
      .sort((a, b) =>
        sort === "new"
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [wishes, q, sort, filterApproved]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((w) => w.id)));
    }
  };

  const bulkApprove = async (approve: boolean) => {
    setBulkLoading(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => setWishApproved(id, approve)));
    setWishes((prev) => prev.map((w) => (selected.has(w.id) ? { ...w, is_approved: approve } : w)));
    setSelected(new Set());
    toast.success(approve ? `Đã duyệt ${ids.length} lời chúc` : `Đã ẩn ${ids.length} lời chúc`);
    setBulkLoading(false);
  };

  const bulkDelete = async () => {
    const ok = await confirmDialog({
      title: "Xóa lời chúc",
      message: `Xóa ${selected.size} lời chúc đã chọn? Thao tác không thể hoàn tác.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (!ok) return;
    setBulkLoading(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map((id) => deleteWish(id)));
    setWishes((prev) => prev.filter((w) => !selected.has(w.id)));
    setSelected(new Set());
    toast.success(`Đã xóa ${ids.length} lời chúc`);
    setBulkLoading(false);
  };

  const handleDeleteWish = async (id: string) => {
    const ok = await confirmDialog({
      title: "Xóa lời chúc",
      message: "Bạn có chắc muốn xóa lời chúc này?",
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (!ok) return;
    const { error } = await deleteWish(id);
    if (error) toast.error(error);
    else {
      setWishes((prev) => prev.filter((x) => x.id !== id));
      toast.success("Đã xóa lời chúc");
    }
  };

  const exportCSV = () => {
    const rows = [
      ["Tên khách", "Lời chúc", "Trạng thái", "Thời gian"].join(","),
      ...wishes.map((w) =>
        [
          `"${w.guest_name.replace(/"/g, '""')}"`,
          `"${w.message.replace(/"/g, '""')}"`,
          w.is_approved ? "Đã duyệt" : "Chờ duyệt",
          new Date(w.created_at).toLocaleString("vi-VN"),
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loi-chuc-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý lời chúc</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Duyệt và quản lý lời chúc từ khách mời để hiển thị trên thiệp cưới của bạn.{" "}
            <span className="text-neutral-400">({wishes.length} lời chúc · {wishes.filter((w) => w.is_approved).length} đã duyệt)</span>
          </p>
        </div>
        {canExportWishes ? (
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-neutral-50"
          >
            <Download className="h-4 w-4" />
            Xuất CSV
          </button>
        ) : (
          <a
            href="/dashboard/goi-dich-vu"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
          >
            <Crown className="h-4 w-4" />
            Nâng cấp để xuất CSV
          </a>
        )}
      </div>

      {/* Upsell banner for basic */}
      {showUpsell && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Nâng cấp để duyệt lời chúc tự động</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Gói Pro/VIP cho phép tự động duyệt lời chúc và hiển thị không giới hạn trên thiệp cưới.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          placeholder="Tìm kiếm..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <select
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as "new" | "old")}
        >
          <option value="new">Mới nhất</option>
          <option value="old">Cũ nhất</option>
        </select>
        <select
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          value={filterApproved}
          onChange={(e) => { setFilterApproved(e.target.value as typeof filterApproved); setPage(1); }}
        >
          <option value="all">Tất cả</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
        </select>
        <select
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value) as typeof pageSize); setPage(1); }}
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>{s} / trang</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <span className="text-sm font-medium text-rose-800">Đã chọn {selected.size}</span>
          <button
            onClick={() => bulkApprove(true)}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Duyệt tất cả
          </button>
          <button
            onClick={() => bulkApprove(false)}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            Ẩn tất cả
          </button>
          <button
            onClick={bulkDelete}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-rose-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* List */}
      {paginated.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-16 text-center">
          <p className="text-neutral-500">Không tìm thấy lời chúc nào</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {paginated.map((w) => (
            <div
              key={w.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition ${selected.has(w.id) ? "border-rose-300 ring-2 ring-rose-100" : "border-neutral-100"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(w.id)}
                    onChange={() => toggleSelect(w.id)}
                    className="h-4 w-4 rounded border-neutral-300 accent-rose-500"
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                    {w.guest_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-medium">{w.guest_name}</p>
                    <p className="text-xs text-neutral-500">{new Date(w.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      w.is_approved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {w.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-800">{w.message}</p>
              <div className="mt-3 flex gap-3 border-t border-neutral-50 pt-3">
                <button
                  type="button"
                  className="text-xs font-medium text-rose-600 hover:underline"
                  onClick={async () => {
                    const { error } = await setWishApproved(w.id, !w.is_approved);
                    if (error) toast.error(error);
                    else {
                      setWishes((prev) => prev.map((x) => (x.id === w.id ? { ...x, is_approved: !w.is_approved } : x)));
                      toast.success(w.is_approved ? "Đã ẩn lời chúc" : "Đã duyệt lời chúc");
                    }
                  }}
                >
                  {w.is_approved ? "Ẩn" : "Duyệt"}
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:underline"
                  onClick={() => void handleDeleteWish(w.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-neutral-50"
            >
              ←
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${p === page ? "border-rose-300 bg-rose-50 font-semibold text-rose-700" : "hover:bg-neutral-50"}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-neutral-50"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Select all on current page */}
      {paginated.length > 0 && (
        <div className="text-right">
          <button onClick={toggleSelectAll} className="text-xs text-neutral-500 hover:text-rose-600 hover:underline">
            {selected.size === paginated.length ? "Bỏ chọn tất cả" : "Chọn tất cả trang này"}
          </button>
        </div>
      )}
    </div>
  );
}
