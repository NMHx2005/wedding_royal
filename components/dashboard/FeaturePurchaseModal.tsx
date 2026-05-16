"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { CheckCircle2, CreditCard } from "lucide-react";
import type { Plan } from "@/types";

type FeatureCatalogRow = {
  key: string;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string | null;
  currentPlan: Plan;
};

export function FeaturePurchaseModal({ open, onOpenChange, cardId, currentPlan }: Props) {
  const [features, setFeatures] = useState<FeatureCatalogRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const selectedKeys = useMemo(() => Array.from(selected), [selected]);

  const totalPrice = useMemo(() => {
    if (selectedKeys.length === 0) return 0;
    const priceByKey = new Map(features.map((f) => [f.key, f.price]));
    return selectedKeys.reduce((sum, k) => sum + (priceByKey.get(k) ?? 0), 0);
  }, [features, selectedKeys]);

  useEffect(() => {
    if (!open) return;
    if (!cardId) return;

    let cancelled = false;
    setLoadingCatalog(true);
    fetch("/api/feature-catalog")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return (await r.json()) as { features: FeatureCatalogRow[] };
      })
      .then(({ features }) => {
        if (cancelled) return;
        setFeatures(features);
        setSelected(new Set());
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Không tải được tính năng");
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, cardId]);

  const toggleKey = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const canBuy = !!cardId && selectedKeys.length > 0 && !purchasing;

  const buy = async () => {
    if (!cardId) return;
    if (selectedKeys.length === 0) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/create-feature-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, featureKeys: selectedKeys }),
      });
      const json = (await res.json()) as { checkoutUrl?: string; error?: string };
      if (!res.ok || !json.checkoutUrl) {
        toast.error(json.error ?? "Không tạo được thanh toán");
        return;
      }
      toast.success("Đang chuyển tới thanh toán…");
      onOpenChange(false);
      window.location.href = json.checkoutUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Thanh toán thất bại");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px]" />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[min(92vh,880px)] w-[min(100%,46rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl outline-none sm:max-w-3xl",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
            <Dialog.Title className="text-xl font-bold text-neutral-900">Mua lẻ các tính năng</Dialog.Title>
            <Dialog.Close
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Đóng"
            >
              ×
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 sm:px-6">
            <div className="py-4">
              <p className="mb-3 text-sm font-semibold text-neutral-900">Tính năng có thể mua</p>

              {loadingCatalog ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                  Đang tải danh sách tính năng…
                </div>
              ) : features.length === 0 ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                  Không có tính năng nào để hiển thị.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((f) => {
                    const checked = selected.has(f.key);
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => toggleKey(f.key)}
                        className={clsx(
                          "flex items-start justify-between gap-4 rounded-xl border p-4 text-left transition",
                          checked
                            ? "border-rose-200 bg-rose-50"
                            : "border-neutral-200 bg-white hover:bg-neutral-50",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <span
                              className={clsx(
                                "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border",
                                checked
                                  ? "border-rose-400 bg-rose-600 text-white"
                                  : "border-neutral-300 bg-white text-neutral-400",
                              )}
                            >
                              {checked ? <CheckCircle2 className="h-4 w-4" /> : null}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-neutral-900">{f.name}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-neutral-600">{f.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-xs font-bold text-neutral-900">{f.price.toLocaleString("vi-VN")} ₫</div>
                          <div className="mt-1 text-[10px] text-neutral-500">Mua lẻ</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <footer className="shrink-0 border-t border-neutral-200 bg-neutral-50/90 px-5 py-4 sm:px-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-neutral-900">Phương thức thanh toán</p>
                <p className="mt-1 text-xs text-neutral-600">
                  Thanh toán qua PayOS — giá cập nhật từ admin
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-neutral-800">
                <CreditCard className="h-4 w-4 text-rose-600" />
                Tổng: {totalPrice.toLocaleString("vi-VN")} ₫
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={buy}
                disabled={!canBuy}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {purchasing ? "Đang xử lý…" : "Mua"}
              </button>
              <Dialog.Close
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
              >
                Đóng
              </Dialog.Close>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              Sau khi thanh toán thành công, các tính năng sẽ được kích hoạt ngay lập tức cho tài khoản của bạn.
            </p>

            {currentPlan === "basic" && (
              <p className="mt-1 text-[11px] text-neutral-500">
                Bạn đang ở gói BASIC. Việc mua lẻ sẽ bổ sung theo từng tính năng.
              </p>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

