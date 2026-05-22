import {
  BarChart3,
  CreditCard,
  Gift,
  LayoutTemplate,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Users,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Cards", href: "/admin/cards", icon: CreditCard },
  { label: "Templates", href: "/admin/templates", icon: LayoutTemplate },
  { label: "Features", href: "/admin/features", icon: Star },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Video", href: "/admin/video-catalog", icon: Video },
  { label: "Referrals", href: "/admin/referrals", icon: Gift },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function isAdminNavActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}
