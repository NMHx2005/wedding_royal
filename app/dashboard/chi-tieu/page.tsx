import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChiTieuClient from "./ChiTieuClient";

export const metadata = { title: "Quản lý chi tiêu" };

export default async function ChiTieuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return <ChiTieuClient cardId={card?.id ?? null} />;
}
