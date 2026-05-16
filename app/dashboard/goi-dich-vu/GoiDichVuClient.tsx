"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { OrderRow, Plan } from "@/types";
import type { PlanPricesMap } from "@/lib/plans/get-plan-prices";
import { formatVnd } from "@/lib/utils";

type Props = { cardId: string; currentPlan: Plan; orders: OrderRow[]; planPrices: PlanPricesMap };

export function GoiDichVuClient({ cardId, currentPlan, orders: initial, planPrices }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders] = useState(initial);

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
        toast.success("Thanh toán thành công — gói / tính năng đã được kích hoạt");
      } else {
        toast.message(
          "Đang chờ xác nhận thanh toán. Nếu đã chuyển khoản, thử tải lại trang sau vài giây.",
        );
      }
      router.refresh();
      router.replace("/dashboard/goi-dich-vu");
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  const pay = async (plan: "pro" | "vip") => {
    const res = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, cardId }),
    });
    const json = (await res.json()) as { checkoutUrl?: string; error?: string };
    if (!res.ok || !json.checkoutUrl) {
      toast.error(json.error ?? "Không tạo được thanh toán");
      return;
    }
    window.location.href = json.checkoutUrl;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Gói dịch vụ</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Gói hiện tại: <strong className="text-mewedding-rose">{currentPlan.toUpperCase()}</strong>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <PlanCard
          name="Basic"
          price="Miễn phí"
          features={["1 thiệp", "Không giới hạn khách", "Mẫu Classic"]}
          cta={currentPlan === "basic" ? "Gói hiện tại" : "—"}
          disabled
          onPay={() => {}}
        />
        <PlanCard
          name="Pro"
          price={formatVnd(planPrices.pro.price)}
          features={["Mẫu Pro", "Album 40 ảnh", "Nhạc nền", "Hiệu ứng"]}
          highlight
          cta="Nâng cấp Pro"
          disabled={currentPlan === "vip" || currentPlan === "pro"}
          onPay={() => void pay("pro")}
        />
        <PlanCard
          name="VIP"
          price={formatVnd(planPrices.vip.price)}
          features={["Full tính năng", "Ảnh không giới hạn", "Bỏ branding", "VIP guest"]}
          cta="Nâng cấp VIP"
          disabled={currentPlan === "vip"}
          onPay={() => void pay("vip")}
        />
      </div>
      <div>
        <h2 className="font-medium">Lịch sử thanh toán</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {orders.map((o) => {
            const isFeatures = o.order_type === "features";
            const label = isFeatures
              ? `Tính năng (${Array.isArray(o.feature_keys) ? o.feature_keys.length : 0})`
              : o.plan.toUpperCase();

            return (
              <li key={o.id} className="flex justify-between rounded border bg-white px-3 py-2">
                <span>
                  {label} — {o.status}
                </span>
                <span>{formatVnd(o.amount)}</span>
              </li>
            );
          })}
          {orders.length === 0 && <li className="text-neutral-500">Chưa có giao dịch</li>}
        </ul>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  cta,
  onPay,
  disabled,
  highlight,
}: {
  name: string;
  price: string;
  features: string[];
  cta: string;
  onPay: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm ${
        highlight ? "border-2 border-pink-400 ring-2 ring-pink-100" : "border-neutral-100"
      }`}
    >
      {highlight && (
        <span className="mb-2 inline-block rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
          Phổ biến nhất
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-2 text-2xl font-bold text-mewedding-rose">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-neutral-700">
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
      <button
        type="button"
        disabled={disabled}
        onClick={onPay}
        className="mt-6 w-full rounded-lg bg-mewedding-rose py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {cta}
      </button>
    </div>
  );
}
