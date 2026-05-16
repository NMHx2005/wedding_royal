"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import clsx from "clsx";
import {
  PLAN_DISPLAY_NAMES,
  PLAN_FEATURE_ROWS,
  type FeatureCell,
  type PlanKey,
} from "@/lib/data/pricing-plan-features";

function FeatureStatus({ value }: { value: FeatureCell }) {
  if (value === "yes") {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
    );
  }
  return (
    <span className="max-w-[9.5rem] text-right text-xs font-medium leading-snug text-neutral-800 sm:max-w-none sm:text-sm">
      {value}
    </span>
  );
}

type Props = {
  plan: PlanKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuyFeatures?: () => void;
};

export function PlanDetailModal({ plan, open, onOpenChange, onBuyFeatures }: Props) {
  if (!plan) return null;

  const title = PLAN_DISPLAY_NAMES[plan];
  const showUpgrade = plan !== "vip";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[2px]" />
        <Dialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-[101] flex max-h-[min(92vh,880px)] w-[min(100%,42rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl outline-none sm:max-w-3xl",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
            <Dialog.Title className="text-xl font-bold text-neutral-900">Chi tiết gói {title}</Dialog.Title>
            <Dialog.Description className="sr-only">
              Danh sách tính năng và trạng thái của gói {title}
            </Dialog.Description>
            <Dialog.Close
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
              aria-label="Đóng"
            >
              ×
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 sm:px-6">
            <div className="sticky top-0 z-10 -mx-5 border-b border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
              <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wide text-neutral-500 sm:text-sm">
                <span>Tính năng</span>
                <span>Trạng thái</span>
              </div>
            </div>
            <ul className="divide-y divide-neutral-100">
              {PLAN_FEATURE_ROWS.map((row) => (
                <li key={row.label} className="flex items-start justify-between gap-4 py-3.5 first:pt-2">
                  <p className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-800 sm:text-[15px]">{row.label}</p>
                  <div className="flex shrink-0 items-center justify-end">
                    <FeatureStatus value={row[plan]} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <footer className="shrink-0 border-t border-neutral-200 bg-neutral-50/90 px-5 py-4 sm:px-6">
            <p className="text-center text-xs leading-relaxed text-neutral-600 sm:text-left">
              Thêm dịch vụ thiết kế hộ hoặc nâng cấp lên gói cao hơn
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onBuyFeatures?.();
                }}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 sm:text-sm"
              >
                Mua thêm tính năng
              </button>
              {showUpgrade ? (
                <Link
                  href="/register"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 sm:text-sm"
                >
                  Nâng cấp gói thiệp
                </Link>
              ) : (
                <Link
                  href="/register"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#e7bb06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#d4ab05] sm:text-sm"
                >
                  Chọn gói VIP
                </Link>
              )}
            </div>
            <Dialog.Close
              type="button"
              className="mt-3 w-full rounded-lg border border-neutral-300 bg-white py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Đóng
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
