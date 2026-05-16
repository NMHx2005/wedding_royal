import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import KeHoachClient from "./KeHoachClient";

export const metadata = { title: "Kế hoạch cưới" };

export default async function KeHoachPage() {
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

  return <KeHoachClient cardId={card?.id ?? null} />;
}
