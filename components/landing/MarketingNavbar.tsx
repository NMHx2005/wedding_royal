"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, User, X } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gentleEase } from "@/components/motion/gentle";

const MEHAPPY_ASSET = "https://mehappy.vn";

const desktopInactive =
  "text-neutral-800 hover:bg-rose-50/90 hover:text-rose-600";
const desktopActive =
  "bg-rose-100 font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200/70";

const mobileInactive = "text-neutral-800 hover:bg-rose-50/90 hover:text-rose-600";
const mobileActive = "bg-rose-100 font-semibold text-rose-700 ring-1 ring-rose-200/70";

export function MarketingNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const isKho = pathname === "/kho-giao-dien" || pathname.startsWith("/kho-giao-dien/");
  const isBangGia = pathname === "/bang-gia" || pathname.startsWith("/bang-gia/");
  const isCouples = pathname === "/cac-cap-doi" || pathname.startsWith("/cac-cap-doi/");
  const isLienHe = pathname === "/lien-he" || pathname.startsWith("/lien-he/");

  const desktopClass = (active: boolean) =>
    clsx(
      "motion-soft rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active ? desktopActive : desktopInactive,
    );

  const mobileClass = (active: boolean) =>
    clsx("motion-soft rounded-lg px-2 py-2 text-left transition-colors", active ? mobileActive : mobileInactive);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-rose-100/60 bg-white/95 backdrop-blur"
      initial={reduce ? { y: 0 } : { y: -6 }}
      animate={{ y: 0 }}
      transition={{ duration: reduce ? 0 : 0.45, ease: [...gentleEase] }}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="motion-soft flex shrink-0 items-center gap-2 rounded-lg py-0.5 hover:bg-rose-50/80">
          <Image
            src={`${MEHAPPY_ASSET}/images/logo-trong.png`}
            alt="meWedding"
            width={120}
            height={48}
            className="h-8 w-auto sm:h-10 md:h-12"
            priority
          />
          <span className="font-sans text-xl font-semibold text-neutral-900 sm:text-2xl">meWedding</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex" aria-label="Chính">
          <a
            href="/"
            rel="noopener noreferrer"
            className={desktopClass(false)}
          >
            MeHappy
          </a>
          <Link href="/kho-giao-dien" className={desktopClass(isKho)} aria-current={isKho ? "page" : undefined}>
            Mẫu thiệp
          </Link>
          <Link href="/cac-cap-doi" className={desktopClass(isCouples)} aria-current={isCouples ? "page" : undefined}>
            Các cặp đôi
          </Link>
          <Link href="/bang-gia" className={desktopClass(isBangGia)} aria-current={isBangGia ? "page" : undefined}>
            Bảng giá
          </Link>
          <Link href="/lien-he" className={desktopClass(isLienHe)} aria-current={isLienHe ? "page" : undefined}>
            Liên hệ
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="motion-soft hidden rounded-full p-2 text-neutral-600 hover:bg-neutral-100 hover:text-rose-600 lg:flex"
            aria-label="Thông báo"
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link
            href="/login"
            className="motion-soft hidden rounded-full p-2 text-neutral-600 hover:bg-neutral-100 hover:text-rose-600 lg:flex"
            aria-label="Cài đặt"
          >
            <User className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link
            href="/login"
            className="motion-soft hidden rounded-full bg-rose-500 px-5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-rose-600 sm:text-sm md:inline-flex"
          >
            Đăng nhập
          </Link>
          <button
            type="button"
            className="motion-soft rounded-lg p-2 text-neutral-700 hover:bg-rose-50/80 hover:text-rose-600 lg:hidden active:scale-95"
            aria-label="Menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="flex flex-col gap-1 border-t border-rose-100 px-4 py-4 lg:hidden"
            initial={reduce ? { y: 0 } : { y: -8 }}
            animate={{ y: 0 }}
            exit={reduce ? { y: 0 } : { y: -6 }}
            transition={{ duration: reduce ? 0 : 0.38, ease: [...gentleEase] }}
            aria-label="Menu di động"
          >
            <a
              href="https://mehappy.vn"
              target="_blank"
              rel="noopener noreferrer"
              className={mobileClass(false)}
              onClick={() => setOpen(false)}
            >
              MeHappy
            </a>
            <Link
              href="/kho-giao-dien"
              className={mobileClass(isKho)}
              aria-current={isKho ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Mẫu thiệp
            </Link>
            <Link
              href="/cac-cap-doi"
              className={mobileClass(isCouples)}
              aria-current={isCouples ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Các cặp đôi
            </Link>
            <Link
              href="/bang-gia"
              className={mobileClass(isBangGia)}
              aria-current={isBangGia ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Bảng giá
            </Link>
            <Link
              href="/lien-he"
              className={mobileClass(isLienHe)}
              aria-current={isLienHe ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Liên hệ
            </Link>
            <Link
              href="/login"
              className="motion-soft mt-2 inline-flex justify-center rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
              onClick={() => setOpen(false)}
            >
              Đăng nhập
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
