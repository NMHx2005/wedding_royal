"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { VideoCatalog, VideoOrder, VideoOrderStatus } from "@/types";

const STATUS_LABELS: Record<VideoOrderStatus, string> = {
  created: "Đã tạo",
  pending_payment: "Chờ thanh toán",
  paid: "Đã thanh toán",
  in_progress: "Đang xử lý",
  delivered: "Đã giao",
  completed: "Hoàn thành",
  canceled: "Đã hủy",
};

const STATUS_COLORS: Record<VideoOrderStatus, string> = {
  created: "bg-gray-100 text-gray-600",
  pending_payment: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  canceled: "bg-red-100 text-red-600",
};

const FILTER_OPTIONS: { value: "all" | VideoOrderStatus; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "created", label: "Đã tạo" },
  { value: "pending_payment", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "delivered", label: "Đã giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "canceled", label: "Đã hủy" },
];

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

interface Props {
  cardId: string | null;
  userId: string;
  initialOrders: VideoOrder[];
  catalog: VideoCatalog[];
}

export default function VideoOrdersClient({ cardId, userId, initialOrders, catalog }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<VideoOrder[]>(initialOrders);
  const [filter, setFilter] = useState<"all" | VideoOrderStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<VideoCatalog | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("cancelled")) {
      toast.message("Đã hủy thanh toán");
      return;
    }
    if (!searchParams.get("success")) return;

    let cancelled = false;
    const orderId = searchParams.get("orderId");

    void (async () => {
      const res = await fetch("/api/payos/sync-after-return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderId ? { orderId } : {}),
      });
      const data = (await res.json()) as { ok?: boolean; fulfilled?: boolean; error?: string };
      if (cancelled) return;

      if (!res.ok) {
        toast.error(data.error ?? "Không đồng bộ được trạng thái thanh toán");
      } else if (data.fulfilled) {
        toast.success("Thanh toán thành công — đơn video đã được kích hoạt");
      } else {
        toast.message(
          "Đang chờ xác nhận thanh toán. Nếu đã chuyển khoản, thử tải lại trang sau vài giây.",
        );
      }
      router.refresh();
      router.replace("/dashboard/video-orders");
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statsTotal = orders.length;
  const statsInProgress = orders.filter((o) => o.status === "in_progress").length;
  const statsDelivered = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed"
  ).length;

  const handleOrder = async () => {
    if (!selectedCatalog) {
      toast.error("Vui lòng chọn gói video.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("video_orders")
      .insert({
        user_id: userId,
        card_id: cardId,
        catalog_id: selectedCatalog.id,
        title: selectedCatalog.name,
        package: selectedCatalog.package,
        status: "created",
        price: selectedCatalog.price,
        note: note || null,
      })
      .select()
      .single();

    setSubmitting(false);
    if (error) {
      toast.error(`Lỗi đặt hàng: ${error.message}`);
      return;
    }

    const videoOrder = data as VideoOrder;
    const payRes = await fetch("/api/create-video-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoOrderId: videoOrder.id }),
    });
    const payData = await payRes.json();

    if (!payRes.ok || !payData.checkoutUrl) {
      setOrders((prev) => [videoOrder, ...prev]);
      setShowModal(false);
      toast.error(payData.error ?? "Đã tạo đơn nhưng không mở được thanh toán");
      return;
    }

    window.location.href = payData.checkoutUrl as string;
  };

  return (
    <div className="relative space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">Đơn hàng Video</h1>
          <p className="mt-1 text-sm text-neutral-500">Đặt hàng video cưới chuyên nghiệp và theo dõi tiến trình sản xuất từ đội ngũ của chúng tôi.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-neutral-800">{statsTotal}</p>
          <p className="mt-1 text-xs text-neutral-500">Tổng đơn hàng</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-blue-600">{statsInProgress}</p>
          <p className="mt-1 text-xs text-blue-500">Đang xử lý</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-emerald-600">{statsDelivered}</p>
          <p className="mt-1 text-xs text-emerald-500">Đã giao / Hoàn thành</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === opt.value
                ? "bg-rose-500 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-16 text-center text-neutral-400">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
            />
          </svg>
          <p className="text-sm">
            {filter === "all"
              ? "Bạn chưa có đơn hàng video nào."
              : "Không có đơn hàng nào ở trạng thái này."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral-800 truncate">{order.title}</h3>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600 uppercase">
                      {order.package}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span className="font-semibold text-rose-600">{formatVND(order.price)}</span>
                    <span>
                      {new Date(order.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {order.note && (
                    <p className="mt-1 text-sm text-neutral-500 italic">{order.note}</p>
                  )}
                </div>
                {order.delivered_url && (
                  <a
                    href={order.delivered_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-purple-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-600"
                  >
                    Xem video
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating order button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-rose-500 px-5 py-3 font-medium text-white shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl active:scale-95 z-40"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Đặt hàng Video
      </button>

      {/* Order modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-800">Chọn gói Video</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedCatalog(null);
                  setNote("");
                }}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Catalog cards */}
              {catalog.length === 0 ? (
                <p className="text-center text-sm text-neutral-400 py-8">
                  Hiện chưa có gói video nào.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {catalog.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCatalog(item)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        selectedCatalog?.id === item.id
                          ? "border-rose-400 bg-rose-50"
                          : "border-neutral-100 hover:border-rose-200 hover:bg-rose-50/40"
                      }`}
                    >
                      {item.thumbnail_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail_url}
                          alt={item.name}
                          className="mb-3 h-32 w-full rounded-lg object-cover"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-800">{item.name}</p>
                          {item.description && (
                            <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600 uppercase">
                          {item.package}
                        </span>
                      </div>
                      <p className="mt-2 font-bold text-rose-600">{formatVND(item.price)}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Note */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập yêu cầu hoặc ghi chú cho đơn hàng..."
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCatalog(null);
                    setNote("");
                  }}
                  className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleOrder}
                  disabled={!selectedCatalog || submitting}
                  className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  {submitting ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
