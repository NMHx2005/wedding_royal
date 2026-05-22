import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
      <AdminSidebar userEmail={user.email ?? ""} />

      <main className="flex-1 lg:ml-56">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
