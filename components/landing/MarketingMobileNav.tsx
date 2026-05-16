"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, Phone, Tag, Users } from "lucide-react";
import clsx from "clsx";

export function MarketingMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose-100 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur md:hidden"
      aria-label="Điều hướng nhanh"
    >
      <div className="grid grid-cols-5 gap-0 px-1 py-2 text-[10px] text-neutral-600">
        <Link
          href="/"
          className={clsx(
            "flex flex-col items-center gap-1 py-1 hover:text-rose-600",
            pathname === "/" && "font-medium text-rose-600",
          )}
        >
          <Home className="h-5 w-5" aria-hidden />
          <span>Home</span>
        </Link>
        <Link
          href="/cac-cap-doi"
          className={clsx(
            "flex flex-col items-center gap-1 py-1 hover:text-rose-600",
            pathname === "/cac-cap-doi" && "font-medium text-rose-600",
          )}
        >
          <Users className="h-5 w-5" aria-hidden />
          <span>Cặp đôi</span>
        </Link>
        <Link
          href="/register"
          className={clsx("flex flex-col items-center gap-1 py-1", pathname === "/register" && "text-rose-600")}
        >
          <span
            className={clsx(
              "-mt-3 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg",
              pathname === "/register" ? "bg-rose-600 ring-2 ring-rose-300" : "bg-rose-500",
            )}
          >
            <PenLine className="h-5 w-5" aria-hidden />
          </span>
          <span className={clsx("font-medium", pathname === "/register" ? "text-rose-700" : "text-rose-600")}>
            Tạo
          </span>
        </Link>
        <Link
          href="/bang-gia"
          className={clsx(
            "flex flex-col items-center gap-1 py-1 hover:text-rose-600",
            pathname === "/bang-gia" && "font-medium text-rose-600",
          )}
        >
          <Tag className="h-5 w-5" aria-hidden />
          <span>Giá</span>
        </Link>
        <Link
          href="/lien-he"
          className={clsx(
            "flex flex-col items-center gap-1 py-1 hover:text-rose-600",
            pathname === "/lien-he" && "font-medium text-rose-600",
          )}
        >
          <Phone className="h-5 w-5" aria-hidden />
          <span>Liên hệ</span>
        </Link>
      </div>
    </nav>
  );
}
