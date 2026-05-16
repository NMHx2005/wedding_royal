import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SanPhamClient from "./SanPhamClient";

export const metadata = { title: "Sản phẩm liên kết" };

export default async function SanPhamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: products } = await supabase
    .from("affiliate_products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return <SanPhamClient initialProducts={products ?? []} />;
}
