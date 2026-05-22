"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Copy,
  Crown,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { createWeddingCard } from "@/app/actions/wedding-card";
import { MEHAPPY_ASSET } from "@/lib/data/mehappy-landing";
import type { CardStatus, Plan } from "@/types";
import { cn } from "@/lib/utils";

export type DashboardStats = {
  totalCards: number;
  publicCards: number;
  activeCards: number;
  totalViews: number;
  guestCount: number;
  wishCount: number;
};

export type DashboardCardItem = {
  id: string;
  slug: string;
  plan: Plan;
  status: CardStatus;
  brideName: string;
  groomName: string;
  weddingDate: string;
  createdAt: string;
  coverImageUrl: string | null;
  viewCount: number;
  hasStats: boolean;
  hasEditorContent: boolean;
  isRawHtml?: boolean;
};

type Props = {
  plan: Plan;
  stats: DashboardStats;
  hasStats?: boolean;
  cards: DashboardCardItem[];
  maxCards?: number;
};

const STAT_ITEMS: { key: keyof DashboardStats; label: string }[] = [
  { key: "totalCards", label: "Tổng số thiệp cưới" },
  { key: "publicCards", label: "Thiệp công khai" },
  { key: "activeCards", label: "Thiệp đang hoạt động" },
  { key: "totalViews", label: "Tổng lượt xem" },
  { key: "guestCount", label: "Khách mời" },
  { key: "wishCount", label: "Lời chúc" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function planLabel(plan: Plan) {
  if (plan === "vip") return "VIP";
  if (plan === "pro") return "PRO";
  return "BASIC";
}

function statusLabel(status: CardStatus) {
  if (status === "active") return "Công khai";
  if (status === "expired") return "Hết hạn";
  return "Riêng tư";
}

function statusColor(status: CardStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "expired") return "bg-neutral-100 text-neutral-500";
  return "bg-amber-50 text-amber-700";
}

function InvitationCard({ card, appOrigin }: { card: DashboardCardItem; appOrigin: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const publicUrl = `${appOrigin}/thiep/${card.slug}`;
  const title = `${card.groomName} & ${card.brideName}`;
  const manageHref = `/dashboard/${card.id}/ho-so`;

  const copyUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Đã sao chép link thiệp");
    } catch {
      toast.error("Không sao chép được");
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-rose-200 hover:shadow-md">
      {/* Cover — overlay link (z-[1]) sits on top of it, making it fully clickable */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {card.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-100 to-amber-50 text-5xl">
            💒
          </div>
        )}
        {/* Hover badge — pointer-events-none so the overlay link receives clicks */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
          <span className="scale-90 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-rose-600 opacity-0 shadow transition group-hover:scale-100 group-hover:opacity-100">
            Quản lý thiệp →
          </span>
        </div>
      </div>

      {/* Overlay link: z-[1] covers cover + non-interactive text; interactive children use z-10 */}
      <Link href={manageHref} className="absolute inset-0 z-[1]" aria-label={`Quản lý thiệp ${title}`} />

      <div className="relative flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                {planLabel(card.plan)}
              </span>
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", statusColor(card.status))}>
                {statusLabel(card.status)}
              </span>
            </div>
            <h2 className="mt-2 line-clamp-2 text-sm font-bold text-neutral-900">{title}</h2>
          </div>
        </div>

        <ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
          <li className="flex justify-between gap-2">
            <span>Ngày cưới</span>
            <span className="font-medium text-neutral-800">{formatDate(card.weddingDate)}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Ngày tạo</span>
            <span className="font-medium text-neutral-800">{formatDate(card.createdAt)}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Thống kê</span>
            {card.hasStats ? (
              <span className="font-medium text-neutral-800">{card.viewCount} lượt xem</span>
            ) : (
              <Link href="/dashboard/goi-dich-vu" className="relative z-10 font-medium text-rose-500 hover:underline">
                + Mở khóa
              </Link>
            )}
          </li>
          <li className="pt-1">
            <span className="mb-1 block text-neutral-500">URL</span>
            <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5">
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-700">{card.slug}</span>
              <button
                type="button"
                onClick={copyUrl}
                className="relative z-10 shrink-0 text-rose-500 hover:text-rose-600"
                title="Sao chép link"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        </ul>

        {/* Action buttons — all z-10 to sit above overlay link */}
        <div className="relative z-10 mt-3 grid grid-cols-3 gap-2">
          <Link
            href={`/thiep/${card.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 py-2 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
          >
            <Eye className="h-4 w-4" />
            Xem thiệp
          </Link>
          <Link
            href={`/dashboard/${card.id}/khach-moi`}
            className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 py-2 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
          >
            <Users className="h-4 w-4" />
            Khách mời
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex w-full flex-col items-center gap-1 rounded-lg border border-neutral-200 py-2 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <MoreHorizontal className="h-4 w-4" />
              Khác
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Đóng menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute bottom-full right-0 z-20 mb-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  <Link
                    href={`/dashboard/${card.id}/cai-dat-thiep`}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Cài đặt thiệp
                  </Link>
                  <Link
                    href={`/dashboard/${card.id}/thong-ke`}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Thống kê
                  </Link>
                  <Link
                    href={`/dashboard/${card.id}/thiet-lap`}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Thiết lập thiệp
                  </Link>
                  <Link
                    href={
                      card.hasEditorContent
                        ? `/dashboard/editor/${card.id}`
                        : `/dashboard/${card.id}/thiet-lap?needTemplate=1${
                            card.isRawHtml ? "&source=html" : ""
                          }`
                    }
                    className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {card.hasEditorContent ? "Trình chỉnh sửa" : "Chọn mẫu thiệp"}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function CreateCardTile({
  onCreate,
  pending,
  atLimit,
  maxCards,
}: {
  onCreate: () => void;
  pending: boolean;
  atLimit: boolean;
  maxCards: number;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white shadow-sm">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-neutral-50 p-6">
        <div className="relative h-full w-full max-w-[200px]">
          <Image
            src={`${MEHAPPY_ASSET}/create-invitation-card.png`}
            alt="Tạo thiệp cưới mới"
            fill
            className="object-contain"
            sizes="200px"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center px-6 pb-6 pt-2 text-center">
        <h2 className="text-base font-bold text-neutral-900">Tạo thiệp cưới mới</h2>
        {atLimit ? (
          <>
            <p className="mt-2 text-sm text-neutral-600">
              Gói của bạn cho phép tối đa <strong>{maxCards} thiệp</strong>. Nâng cấp để tạo thêm.
            </p>
            <Link
              href="/dashboard/goi-dich-vu"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            >
              <Crown className="h-4 w-4" />
              Nâng cấp để tạo thêm
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-neutral-600">
              Thiết kế thiệp cưới đẹp cho ngày đặc biệt của bạn
            </p>
            <button
              type="button"
              onClick={onCreate}
              disabled={pending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {pending ? "Đang tạo..." : "Tạo thiệp cưới"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export function DashboardHomeClient({
  plan,
  stats,
  hasStats = false,
  cards,
  maxCards = 1,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const statsLocked = !hasStats && plan === "basic";
  const atLimit = cards.length >= maxCards;

  const appOrigin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }, []);

  const planTitle = plan === "vip" ? "VIP" : plan === "pro" ? "PRO" : "BASIC";

  const handleCreateCard = () => {
    startTransition(async () => {
      const result = await createWeddingCard();
      if (result.error || !result.data) {
        toast.error(result.error ?? "Không tạo được thiệp");
        return;
      }
      toast.success("Đã tạo thiệp mới — hãy thiết lập thông tin");
      router.push(`/dashboard/${result.data.id}/thiet-lap?needTemplate=1`);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-24 md:pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 md:text-2xl">Quản lý thiệp cưới</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {cards.length} / {maxCards} thiệp đang sử dụng
          </p>
        </div>
        {!atLimit && (
          <button
            type="button"
            onClick={handleCreateCard}
            disabled={pending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {pending ? "Đang tạo..." : "Tạo thiệp mới"}
          </button>
        )}
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
            <p className="font-semibold text-neutral-900">Bạn đang dùng gói {planTitle}</p>
            <p className="text-sm text-neutral-500">
              {statsLocked
                ? "Trải nghiệm cơ bản với một số giới hạn"
                : "Cảm ơn bạn đã tin tưởng Royal Wedding"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/goi-dich-vu"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 sm:text-sm"
          >
            Chi tiết gói
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

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <InvitationCard key={card.id} card={card} appOrigin={appOrigin} />
        ))}
        <CreateCardTile
          onCreate={handleCreateCard}
          pending={pending}
          atLimit={atLimit}
          maxCards={maxCards}
        />
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-6 text-center">
        <p className="text-base font-semibold text-neutral-900">Bạn bận rộn? Chúng tôi sẽ thiết kế giúp bạn</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-600">
          Nếu bạn đang quá tải hoặc không có thời gian, đội ngũ của chúng tôi có thể tạo và thiết kế thiệp cưới cho bạn.
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
