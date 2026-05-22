"use client";

import { useEffect, useMemo, useState } from "react";

export const ADMIN_PAGE_SIZES = [10, 20, 50, 100] as const;
export type AdminPageSize = (typeof ADMIN_PAGE_SIZES)[number];

export function useAdminPagination<T>(
  items: T[],
  resetDeps: unknown[] = [],
  initialPageSize: AdminPageSize = 20
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<AdminPageSize>(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when filters change
  }, [...resetDeps, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, items.length);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    paginated,
    totalPages,
    rangeStart,
    rangeEnd,
    filteredCount: items.length,
  };
}
