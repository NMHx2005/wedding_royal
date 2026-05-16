import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarHeart,
  Gift,
  Heart,
  Home,
  ImageIcon,
  MessageCircle,
  Settings,
  ShoppingBag,
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

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Thiệp cưới", icon: Home, href: "/dashboard" },
  { label: "Thống kê thiệp", icon: BarChart3, href: "/dashboard/thong-ke" },
  { label: "Hồ sơ thiệp cưới", icon: Heart, href: "/dashboard/ho-so" },
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
  { label: "Mừng cưới", href: "/dashboard/mung-cuoi" },
  { label: "Gói dịch vụ", href: "/dashboard/goi-dich-vu" },
  { label: "Giao diện", href: "/dashboard/giao-dien" },
];
