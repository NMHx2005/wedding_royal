"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Crown,
  HelpCircle,
  Menu,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MEHAPPY_ASSET } from "@/lib/data/mehappy-landing";
import { DASHBOARD_NAV, DASHBOARD_QUICK_LINKS } from "@/lib/dashboard/nav";
import type { Plan } from "@/types";
import { cn } from "@/lib/utils";
import { DashboardAccountMenu } from "./DashboardAccountMenu";
import { FeaturePurchaseModal } from "./FeaturePurchaseModal";

type Props = {
  children: ReactNode;
  userEmail: string;
  fullName: string | null;
  plan: Plan;
  slug: string | null;
  cardId: string | null;
};

function planBadgeLabel(plan: Plan) {
  if (plan === "vip") return "VIP";
  if (plan === "pro") return "PRO";
  return "BASIC";
}

export function DashboardChrome({ children, userEmail, fullName, plan, slug, cardId }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedHome, setExpandedHome] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  const displayName = fullName || userEmail.split("@")[0] || userEmail;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const hideSupportFab = pathname.startsWith("/dashboard/video-orders");

  const comingSoon = () => toast.message("Tính năng đang được phát triển");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-100">
      <header className="z-40 shrink-0 border-b border-neutral-200 bg-white">
        <div className="flex h-[60px] items-center justify-between gap-3 px-3 md:px-5">
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 md:hidden"
            aria-label="Mở menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
            <Image
              src={`${MEHAPPY_ASSET}/images/logo-trong.png`}
              alt="meWedding"
              width={40}
              height={40}
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <div className="hidden min-w-0 sm:block">
              <p
                className="truncate text-lg font-bold leading-tight text-[#fb4141] sm:text-2xl"
                style={{ fontFamily: '"Dancing Script", cursive' }}
              >
                meWedding
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 sm:text-xs">
                Wedding Manager
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              aria-label="Thông báo"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-1.5 md:flex">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Star className="h-3.5 w-3.5" />
                Góp ý
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!cardId) {
                    toast.error("Chưa tìm thấy thiệp để mua tính năng");
                    return;
                  }
                  setFeatureModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Mua tính năng
              </button>
              <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-bold tracking-wide text-neutral-700">
                {planBadgeLabel(plan)}
              </span>
              <Link
                href="/dashboard/goi-dich-vu"
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
              >
                <Crown className="h-3.5 w-3.5" />
                Nâng cấp
              </Link>
            </div>

            <div className="relative" ref={accountRef}>
              <button
                type="button"
                aria-label="Tài khoản"
                onClick={() => setAccountOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600"
              >
                <span className="text-sm font-semibold">{displayName.charAt(0).toUpperCase()}</span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2">
                  <DashboardAccountMenu displayName={displayName} onClose={() => setAccountOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-modal-backdrop bg-black/40 md:hidden"
            aria-label="Đóng menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-modal flex w-72 flex-col bg-white shadow-xl md:hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 p-3">
              <span className="text-sm font-semibold">Menu</span>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="rounded-lg p-1.5 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {DASHBOARD_NAV.filter((i) => i.href).map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      active ? "bg-rose-50 text-rose-700" : "hover:bg-neutral-50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <p className="px-3 pt-3 text-xs font-semibold uppercase text-neutral-400">Liên kết nhanh</p>
              {DASHBOARD_QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileNavOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
                  {l.label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 md:flex",
            sidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0",
          )}
        >
          <div className="flex items-center justify-end border-b border-neutral-100 p-2">
            <button
              type="button"
              title="Thu gọn menu"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {DASHBOARD_NAV.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : item.href
                    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                    : false;

              if (!item.href) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={comingSoon}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              }

              if (item.children && item.children.length > 0) {
                const childActive = item.children.some((child) =>
                  child.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === child.href || pathname.startsWith(`${child.href}/`),
                );
                const parentRowActive = active && !childActive;

                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setExpandedHome((v) => !v)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium",
                        parentRowActive
                          ? "bg-rose-50 text-rose-700"
                          : active || childActive
                            ? "text-rose-700 hover:bg-neutral-50"
                            : "text-neutral-800 hover:bg-neutral-50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          active || childActive
                            ? "bg-rose-100 text-rose-600"
                            : "bg-neutral-100 text-neutral-600",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronDown
                        className={cn("h-4 w-4 shrink-0 transition", expandedHome && "rotate-180")}
                      />
                    </button>
                    {expandedHome && (
                      <div className="ml-5 space-y-1 border-l border-neutral-200 pl-3">
                        {item.children.map((child) => {
                          const childIsActive =
                            child.href === "/dashboard"
                              ? pathname === "/dashboard"
                              : pathname === child.href || pathname.startsWith(`${child.href}/`);
                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm",
                                childIsActive
                                  ? "bg-rose-50 font-medium text-rose-700"
                                  : "text-neutral-600 hover:bg-neutral-50",
                              )}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active ? "bg-rose-50 text-rose-700" : "text-neutral-800 hover:bg-neutral-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-rose-100 text-rose-600" : "bg-neutral-100 text-neutral-600",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {slug && (
            <div className="border-t border-neutral-100 p-3">
              <Link
                href={`/thiep/${slug}`}
                target="_blank"
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Xem thiệp công khai →
              </Link>
            </div>
          )}
        </aside>

        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="absolute left-2 top-[68px] z-40 hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-sm md:flex"
            aria-label="Mở menu"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        )}

        <main id="main-scroll-container" className="min-h-0 flex-1 overflow-y-auto bg-neutral-50">
          <div
            className={cn(
              pathname === "/dashboard" ? "" : "mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-8",
            )}
          >
            {children}
          </div>
        </main>
      </div>

      <FeaturePurchaseModal
        open={featureModalOpen}
        onOpenChange={setFeatureModalOpen}
        cardId={cardId}
        currentPlan={plan}
      />

      {!hideSupportFab && (
      <div className="pointer-events-none fixed bottom-6 right-4 z-fab flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)] md:right-6">
        <Link
          href="/lien-he"
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-lg ring-1 ring-neutral-200 transition hover:shadow-xl"
        >
          <HelpCircle className="h-5 w-5 text-sky-500" />
          Hỗ trợ
        </Link>
      </div>
      )}
    </div>
  );
}
