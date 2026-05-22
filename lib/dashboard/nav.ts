import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarHeart,
  Gift,
  Heart,
  Home,
  ImageIcon,
  Layers,
  MessageCircle,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Users,
  Video,
  Wallet,
} from "lucide-react";

export type DashboardNavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: { label: string; href: string }[];
};

/** Items shown in sidebar when inside a specific card context */
export const DASHBOARD_CARD_NAV_DEFS: {
  label: string;
  icon: LucideIcon;
  key: string;
}[] = [
  { label: "Hồ sơ thiệp cưới", icon: Heart, key: "ho-so" },
  { label: "Thiết lập thiệp", icon: SlidersHorizontal, key: "thiet-lap" },
  { label: "Cài đặt thiệp cưới", icon: Settings, key: "cai-dat-thiep" },
  { label: "Giao diện thiệp", icon: Layers, key: "giao-dien" },
  { label: "Quản lý khách mời", icon: Users, key: "khach-moi" },
  { label: "Quản lý lời chúc", icon: MessageCircle, key: "loi-chuc" },
  { label: "Quản lý Photobook", icon: ImageIcon, key: "photobook" },
  { label: "Thống kê thiệp", icon: BarChart3, key: "thong-ke" },
  { label: "Kế hoạch cưới", icon: CalendarHeart, key: "ke-hoach" },
  { label: "Quản lý chi tiêu", icon: Wallet, key: "chi-tieu" },
];

/** Build card-scoped nav items for a given cardId */
export function buildCardNav(cardId: string): DashboardNavItem[] {
  return DASHBOARD_CARD_NAV_DEFS.map((d) => ({
    label: d.label,
    icon: d.icon,
    href: `/dashboard/${cardId}/${d.key}`,
  }));
}

/** User-level nav items (not tied to a specific card) */
export const DASHBOARD_USER_NAV: DashboardNavItem[] = [
  { label: "Quản lý thiệp cưới", icon: Home, href: "/dashboard" },
  { label: "Gói dịch vụ", icon: ShoppingBag, href: "/dashboard/goi-dich-vu" },
  { label: "Đơn hàng video", icon: Video, href: "/dashboard/video-orders" },
  { label: "Giới thiệu", icon: Gift, href: "/dashboard/gioi-thieu" },
];

/** @deprecated Use buildCardNav + DASHBOARD_USER_NAV instead */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Thiệp cưới", icon: Home, href: "/dashboard" },
  { label: "Thống kê thiệp", icon: BarChart3, href: "/dashboard/thong-ke" },
  { label: "Hồ sơ thiệp cưới", icon: Heart, href: "/dashboard/ho-so" },
  { label: "Thiết lập thiệp", icon: SlidersHorizontal, href: "/dashboard/thiet-lap" },
  { label: "Quản lý khách mời", icon: Users, href: "/dashboard/khach-moi" },
  { label: "Cài đặt thiệp cưới", icon: Settings, href: "/dashboard/cai-dat-thiep" },
  { label: "Kế hoạch cưới", icon: CalendarHeart, href: "/dashboard/ke-hoach" },
  { label: "Quản lý chi tiêu", icon: Wallet, href: "/dashboard/chi-tieu" },
  { label: "Quản lý lời chúc", icon: MessageCircle, href: "/dashboard/loi-chuc" },
  { label: "Quản lý Photobook", icon: ImageIcon, href: "/dashboard/photobook" },
  { label: "Đơn hàng video của tôi", icon: Video, href: "/dashboard/video-orders" },
  { label: "Giới thiệu", icon: Gift, href: "/dashboard/gioi-thieu" },
  { label: "Sản phẩm liên kết", icon: ShoppingBag, href: "/dashboard/san-pham" },
];

export const DASHBOARD_QUICK_LINKS = [
  { label: "Thiết lập thiệp", href: "/dashboard/thiet-lap" },
  { label: "Mừng cưới", href: "/dashboard/mung-cuoi" },
  { label: "Gói dịch vụ", href: "/dashboard/goi-dich-vu" },
  { label: "Giao diện", href: "/dashboard/giao-dien" },
];
