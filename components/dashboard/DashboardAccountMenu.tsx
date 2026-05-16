"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, KeyRound, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  displayName: string;
  onClose?: () => void;
};

export function DashboardAccountMenu({ displayName, onClose }: Props) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose?.();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="w-[280px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
      <div className="border-b border-neutral-100 px-4 py-4 text-center">
        <p className="text-sm text-neutral-600">Xin chào,</p>
        <p className="truncate text-base font-bold text-neutral-900">{displayName}</p>
      </div>
      <div className="space-y-0.5 p-2">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-rose-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-rose-100 text-rose-600">
            <User className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-900">Dashboard</p>
            <p className="text-xs text-neutral-500">Thông tin cá nhân</p>
          </div>
        </Link>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-neutral-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-100 text-sky-600">
            <Home className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-900">Trang chủ</p>
            <p className="text-xs text-neutral-500">Quay về trang chủ</p>
          </div>
        </Link>
        <Link
          href="/dashboard/cai-dat"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-neutral-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-violet-100 text-violet-600">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-neutral-900">Đổi mật khẩu</p>
            <p className="text-xs text-neutral-500">Thay đổi mật khẩu của bạn</p>
          </div>
        </Link>
      </div>
      <div className="border-t border-neutral-100 px-4 py-3">
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
