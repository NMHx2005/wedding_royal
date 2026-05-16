import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CaiDatThiepClient from "./CaiDatThiepClient";

export const metadata = { title: "Cài đặt thiệp cưới" };

export default async function CaiDatThiepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return <CaiDatThiepClient card={card ?? null} />;
}
