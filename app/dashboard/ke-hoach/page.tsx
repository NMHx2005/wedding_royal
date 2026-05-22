import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function KeHoachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!card) redirect("/dashboard");
  redirect(`/dashboard/${card.id}/ke-hoach`);
}
