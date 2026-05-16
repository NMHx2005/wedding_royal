"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Crown, Plus } from "lucide-react";
import { MEHAPPY_ASSET } from "@/lib/data/mehappy-landing";
import type { Plan } from "@/types";
import { cn } from "@/lib/utils";

export type DashboardStats = {
  totalCards: number;
  publicCards: number;
  activeCards: number;
  totalViews: number;
  guestCount: number;
  wishCount: number;
};

type Props = {
  plan: Plan;
  stats: DashboardStats;
  hasStats?: boolean;
};

const STAT_ITEMS: { key: keyof DashboardStats; label: string }[] = [
  { key: "totalCards", label: "Tổng số thiệp cưới" },
  { key: "publicCards", label: "Thiệp công khai" },
  { key: "activeCards", label: "Thiệp đang hoạt động" },
  { key: "totalViews", label: "Tổng lượt xem" },
  { key: "guestCount", label: "Khách mời" },
  { key: "wishCount", label: "Lời chúc" },
];

export function DashboardHomeClient({ plan, stats, hasStats = false }: Props) {
  const [tab, setTab] = useState<"wedding" | "invite">("wedding");
  const statsLocked = !hasStats && plan === "basic";

  const planTitle =
    plan === "vip" ? "VIP" : plan === "pro" ? "PRO" : "FREE";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24 md:pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-neutral-900 md:text-2xl">Quản lý thiệp cưới</h1>
          <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5">
            <button
              type="button"
              onClick={() => setTab("wedding")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                tab === "wedding"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Thiệp cưới
            </button>
            <button
              type="button"
              onClick={() => setTab("invite")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                tab === "invite"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              Thiệp mời/Thiệp invite
            </button>
          </div>
          <p className="max-w-xl text-sm text-neutral-600">
            Quản lý thiệp cưới của bạn. Bạn có thể chỉnh sửa, tạo mới và quản lý mọi thứ cho thiệp cưới của mình tại
            đây.
          </p>
        </div>
        <Link
          href="/dashboard/thiet-lap"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          <Plus className="h-4 w-4" />
          Tạo thiệp mới
        </Link>
      </div>

      <div className="relative">
        {statsLocked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Link
              href="/dashboard/goi-dich-vu"
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-500"
            >
              <Crown className="h-4 w-4" />
              Mở khóa thống kê
            </Link>
          </div>
        )}
        <div
          className={cn(
            "grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6",
            statsLocked && "pointer-events-none select-none blur-[2px]",
          )}
        >
          {STAT_ITEMS.map(({ key, label }) => (
            <div key={key} className="text-center">
              <p className="text-2xl font-bold text-neutral-900">{stats[key]}</p>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-neutral-900">Bạn đang dùng gói thiệp {planTitle}</p>
            <p className="text-sm text-neutral-500">
              {statsLocked
                ? "Trải nghiệm cơ bản với một số giới hạn"
                : "Cảm ơn bạn đã tin tưởng meWedding"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/goi-dich-vu"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 sm:text-sm"
          >
            Chi tiết gói của bạn
          </Link>
          <Link
            href="/dashboard/goi-dich-vu"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 sm:text-sm"
          >
            Mở khóa thêm các tính năng
          </Link>
          {plan !== "vip" && (
            <Link
              href="/dashboard/goi-dich-vu"
              className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600 sm:text-sm"
            >
              Nâng cấp VIP
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <div className="relative mb-4 h-40 w-full max-w-xs">
            <Image
              src={`${MEHAPPY_ASSET}/create-invitation-card.png`}
              alt="Tạo thiệp cưới mới"
              fill
              className="object-contain"
              sizes="320px"
            />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">Tạo thiệp cưới mới</h2>
          <p className="mt-2 max-w-sm text-sm text-neutral-600">
            Thiết kế một thiệp cưới đẹp cho ngày đặc biệt của bạn
          </p>
          <Link
            href="/dashboard/thiet-lap"
            className="mt-6 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <Plus className="h-4 w-4" />
            Tạo thiệp cưới
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-6 text-center">
        <p className="text-base font-semibold text-neutral-900">Bạn bận rộn? Chúng tôi sẽ thiết kế giúp bạn ❤️</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600">
          Nếu bạn đang quá tải hoặc không có thời gian, đội ngũ của chúng tôi có thể tạo và thiết kế thiệp cưới cho
          bạn.
        </p>
        <Link
          href="/lien-he"
          className="mt-4 inline-flex rounded-xl bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-yellow-600"
        >
          Yêu cầu Hỗ trợ Thiết kế
        </Link>
      </div>
    </div>
  );
}
