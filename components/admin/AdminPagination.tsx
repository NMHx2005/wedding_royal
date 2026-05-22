"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  filteredCount: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function AdminPagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  filteredCount,
  totalCount,
  onPageChange,
  className = "",
}: Props) {
  if (filteredCount === 0) return null;

  return (
    <div
      className={`flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-xs text-gray-500">
        Hiển thị {rangeStart}–{rangeEnd} / {filteredCount}
        {totalCount !== undefined && filteredCount !== totalCount && ` (trong ${totalCount} tổng)`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </button>
        <span className="text-xs tabular-nums text-gray-600">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
