import type { TemplateRow } from "@/types";

const t = "2026-01-01T00:00:00.000Z";

export const STATIC_TEMPLATES: TemplateRow[] = [
  {
    id: "classic-white",
    name: "Classic White",
    description: "Thanh lịch, nền trắng",
    thumbnail_url: null,
    preview_url: null,
    plan_required: "basic",
    style_tags: ["Tối giản", "Vintage"],
    is_active: true,
    sort_order: 1,
    created_at: t,
  },
  {
    id: "golden-luxury",
    name: "Golden Luxury",
    description: "Kem và vàng",
    thumbnail_url: null,
    preview_url: null,
    plan_required: "pro",
    style_tags: ["Luxury"],
    is_active: true,
    sort_order: 2,
    created_at: t,
  },
  {
    id: "minimal-modern",
    name: "Minimal Modern",
    description: "Typography-first",
    thumbnail_url: null,
    preview_url: null,
    plan_required: "pro",
    style_tags: ["Tối giản", "Hàn Quốc"],
    is_active: true,
    sort_order: 3,
    created_at: t,
  },
];
