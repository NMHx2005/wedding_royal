import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  Gift,
  LayoutTemplate,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Users,
  Video,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminNavClient from "./AdminNavClient";

const NAV_ITEMS = [
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

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col bg-gray-900 text-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-gray-700 px-5">
          <span className="text-lg font-bold text-rose-400">⚡ Admin</span>
          <span className="ml-auto rounded bg-rose-600/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-400">
            meWedding
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-gray-700 hover:text-white"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-700 p-4">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="truncate text-sm text-gray-300">{user.email}</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <AdminNavClient navItems={NAV_ITEMS.map((i) => ({ label: i.label, href: i.href }))} />

      {/* Main content */}
      <main className="flex-1 lg:ml-56">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
