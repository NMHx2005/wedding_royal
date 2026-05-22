import type { TemplateRow } from "@/types";

const t = "2026-01-01T00:00:00.000Z";

const MH = "https://s3-hcm-r2.s3cloud.vn/thiepcuoi-mehappy/users/1928";

const THUMBS = {
  basic: `${MH}/2e7efe47-834f-4e87-bc36-901ea3b86810-full.webp`,
  pro: `${MH}/67d91017-be4f-46d2-95e3-95283716d77d-full.webp`,
  vip: `${MH}/661a39aa-5f9f-467f-b506-442ca5331ff2-full.webp`,
};

/** Offline fallback — 3 mẫu Craft khác nhau (đồng bộ showcase-template-variants.mjs) */
export const STATIC_TEMPLATES: TemplateRow[] = [
  {
    id: "save-the-date-vip",
    name: "Royal Gold Luxury",
    description:
      "Phiên bản sang trọng vàng đen: đủ section như Pro, cover & accent luxury, hiệu ứng xuất hiện.",
    thumbnail_url: THUMBS.vip,
    preview_url: "/thiep/thiep-mau-vip",
    plan_required: "vip",
    style_tags: ["Luxury", "Vàng đen", "Đầy đủ tính năng"],
    is_active: true,
    sort_order: 50,
    created_at: t,
  },
  {
    id: "save-the-date-pro",
    name: "Save The Date Cổ Điển",
    description:
      "Mẫu đầy đủ cổ điển hồng: cover, Save the Date, sự kiện, mừng cưới, album ảnh — hiệu ứng xuất hiện.",
    thumbnail_url: THUMBS.pro,
    preview_url: "/thiep/thiep-mau-pro",
    plan_required: "pro",
    style_tags: ["Cổ điển", "Hồng hồng", "Album ảnh"],
    is_active: true,
    sort_order: 40,
    created_at: t,
  },
  {
    id: "save-the-date-basic",
    name: "Lời Mời Tối Giản",
    description:
      "Thiệp tối giản 3 phần: lời mời, đếm ngược, địa điểm — tông kem xanh lá, phù hợp gói Basic.",
    thumbnail_url: THUMBS.basic,
    preview_url: "/thiep/thiep-mau-basic",
    plan_required: "basic",
    style_tags: ["Tối giản", "Xanh lá", "Save the Date"],
    is_active: true,
    sort_order: 30,
    created_at: t,
  },
];
