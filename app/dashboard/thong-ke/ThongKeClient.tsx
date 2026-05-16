"use client";

import Link from "next/link";
import { Crown, Eye, Heart, Users } from "lucide-react";
import type { Plan } from "@/types";
import { cn } from "@/lib/utils";

type Stats = {
  viewCount: number;
  guestCount: number;
  wishCount: number;
  approvedWishes: number;
  status: string;
  slug: string;
};

type WishPreview = {
  guest_name: string;
  message: string;
  is_approved: boolean;
  created_at: string;
};

type Props = {
  hasStats: boolean;
  plan: Plan;
  stats: Stats;
  recentWishes: WishPreview[];
};

export function ThongKeClient({ hasStats, plan, stats, recentWishes }: Props) {
  const locked = !hasStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">Thống kê thiệp cưới</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Theo dõi lượt xem, khách mời và lời chúc cho thiệp của bạn.
        </p>
      </div>

      {locked && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">Mở khóa thống kê chi tiết với gói Pro hoặc tính năng Stats.</p>
          <Link
            href="/dashboard/goi-dich-vu"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            <Crown className="h-4 w-4" />
            Nâng cấp
          </Link>
        </div>
      )}

      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", locked && "pointer-events-none opacity-60 blur-[1px]")}>
        <StatCard icon={Eye} label="Lượt xem" value={stats.viewCount} />
        <StatCard icon={Users} label="Khách mời" value={stats.guestCount} />
        <StatCard icon={Heart} label="Lời chúc" value={stats.wishCount} />
        <StatCard icon={Heart} label="Đã duyệt" value={stats.approvedWishes} accent />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-neutral-800">Thông tin thiệp</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Trạng thái</dt>
              <dd className="font-medium capitalize">{stats.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Gói</dt>
              <dd className="font-medium uppercase">{plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Slug</dt>
              <dd className="font-medium">{stats.slug}</dd>
            </div>
          </dl>
          <Link
            href={`/thiep/${stats.slug}`}
            target="_blank"
            className="mt-4 inline-block text-sm font-medium text-rose-600 hover:underline"
          >
            Xem thiệp công khai →
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-800">Lời chúc gần đây</h2>
            <Link href="/dashboard/loi-chuc" className="text-sm text-rose-600 hover:underline">
              Quản lý →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentWishes.length === 0 ? (
              <li className="text-sm text-neutral-400">Chưa có lời chúc nào.</li>
            ) : (
              recentWishes.map((w, i) => (
                <li key={i} className="border-b border-neutral-50 pb-2 last:border-0">
                  <p className="text-sm font-medium">{w.guest_name}</p>
                  <p className="line-clamp-2 text-xs text-neutral-500">{w.message}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <Icon className={cn("h-5 w-5", accent ? "text-rose-500" : "text-neutral-400")} />
      <p className="mt-3 text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
