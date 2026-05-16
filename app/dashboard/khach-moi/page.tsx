import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import KhachMoiClient from "./KhachMoiClient";

export const metadata = { title: "Quản lý khách mời" };

export default async function KhachMoiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, plan, slug")
    .eq("user_id", user.id)
    .maybeSingle();

  const [{ data: guests }, { data: groups }] = card
    ? await Promise.all([
        supabase
          .from("guests")
          .select("*")
          .eq("card_id", card.id)
          .order("created_at"),
        supabase
          .from("guest_groups")
          .select("*")
          .eq("card_id", card.id)
          .order("created_at"),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <KhachMoiClient
      card={card ?? null}
      initialGuests={guests ?? []}
      initialGroups={groups ?? []}
    />
  );
}
