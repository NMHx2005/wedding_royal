"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type Props = {
  navItems: { label: string; href: string }[];
};

export default function AdminNavClient({ navItems }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 lg:hidden">
        <span className="font-bold text-rose-400">⚡ Admin</span>
        <button onClick={() => setOpen((o) => !o)} className="text-gray-300">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <nav
            className="absolute inset-y-0 left-0 flex w-56 flex-col bg-gray-900 pt-14"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-gray-700 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
