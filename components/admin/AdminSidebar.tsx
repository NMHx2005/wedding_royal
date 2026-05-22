"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

type Props = {
  userEmail: string;
};

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-rose-500/15 font-medium text-rose-300"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-rose-400")} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </>
  );
}

export default function AdminSidebar({ userEmail }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-gray-900 text-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-700 px-5">
          <span className="text-lg font-bold text-rose-400">⚡ Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-2">
            <NavLinks />
          </ul>
        </nav>
        <div className="border-t border-gray-700 p-4">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="truncate text-sm text-gray-300">{userEmail}</p>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 lg:hidden">
        <span className="font-bold text-rose-400">⚡ Admin</span>
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-gray-300" aria-label={open ? "Đóng menu" : "Mở menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <nav
            className="absolute inset-y-0 left-0 flex w-56 flex-col bg-gray-900 pt-14"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
