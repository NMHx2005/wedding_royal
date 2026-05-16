"use client";

import { useMemo, useState } from "react";
import type { AffiliateProduct } from "@/types";

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "all", label: "Tất cả", icon: "🎊" },
  { value: "photography", label: "Nhiếp ảnh", icon: "📷" },
  { value: "dress", label: "Váy cưới", icon: "👗" },
  { value: "flowers", label: "Hoa cưới", icon: "💐" },
  { value: "jewelry", label: "Trang sức", icon: "💍" },
  { value: "transport", label: "Xe cưới", icon: "🚗" },
  { value: "beauty", label: "Làm đẹp", icon: "💄" },
  { value: "cake", label: "Bánh cưới", icon: "🎂" },
  { value: "stationery", label: "Thiệp cưới", icon: "💌" },
  { value: "other", label: "Khác", icon: "✨" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(({ value, label }) => [value, label])
);

const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(({ value, icon }) => [value, icon])
);

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

interface Props {
  initialProducts: AffiliateProduct[];
}

export default function SanPhamClient({ initialProducts }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialProducts, search, activeCategory]);

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">Sản phẩm dành cho cặp đôi</h1>
        <p className="mt-2 text-rose-100 text-sm sm:text-base max-w-xl">
          Khám phá các sản phẩm và dịch vụ được chọn lọc dành riêng cho ngày cưới của bạn.
          Tất cả các sản phẩm đều được kiểm duyệt và có chất lượng tốt nhất.
        </p>
        <div className="mt-4 flex items-center gap-2 text-rose-100 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{initialProducts.length} sản phẩm đang có sẵn</span>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? "bg-rose-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 py-20 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-neutral-600">Không tìm thấy sản phẩm nào</p>
          <p className="mt-1 text-sm text-neutral-400">
            Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="mt-4 rounded-lg bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Thumbnail */}
              {product.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="h-48 w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
                  <span className="text-5xl">
                    {CATEGORY_ICONS[product.category] ?? "✨"}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                {/* Category badge */}
                <span className="mb-2 w-fit rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </span>

                <h3 className="font-semibold text-neutral-800 line-clamp-2">{product.name}</h3>

                {product.description && (
                  <p className="mt-1.5 flex-1 text-sm text-neutral-500 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-bold text-rose-600">{formatVND(product.price)}</span>
                </div>

                {product.link_url ? (
                  <a
                    href={product.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
                  >
                    Xem sản phẩm
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <button
                    disabled
                    className="mt-3 w-full rounded-xl bg-neutral-100 py-2 text-sm font-medium text-neutral-400 cursor-not-allowed"
                  >
                    Chưa có liên kết
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
