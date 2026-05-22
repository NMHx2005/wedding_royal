"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { SUBSCRIPTION_ACTIVATE_PATH } from "@/lib/subscription/messages";

export function SubscriptionPaywallBanner() {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-semibold">Bạn chưa kích hoạt gói dịch vụ</p>
        <p className="mt-1 text-amber-900/90">
          Các mục trong menu sẽ mở sau khi bạn chọn gói và thanh toán thành công.
        </p>
      </div>
      <Link
        href={SUBSCRIPTION_ACTIVATE_PATH}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
      >
        <Crown className="h-4 w-4" />
        Xem gói dịch vụ
      </Link>
    </div>
  );
}
