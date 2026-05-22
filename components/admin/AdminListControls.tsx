"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { ADMIN_PAGE_SIZES, type AdminPageSize } from "@/lib/admin/useAdminPagination";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  pageSize: AdminPageSize;
  onPageSizeChange: (size: AdminPageSize) => void;
  children?: ReactNode;
  className?: string;
};

export function AdminListControls({
  query,
  onQueryChange,
  placeholder = "Tìm kiếm...",
  pageSize,
  onPageSizeChange,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center ${className}`}
    >
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>
      {children}
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value) as AdminPageSize)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400"
        aria-label="Số dòng mỗi trang"
      >
        {ADMIN_PAGE_SIZES.map((s) => (
          <option key={s} value={s}>
            {s} / trang
          </option>
        ))}
      </select>
    </div>
  );
}

export function AdminFilterSelect({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 ${className}`}
    >
      {children}
    </select>
  );
}
