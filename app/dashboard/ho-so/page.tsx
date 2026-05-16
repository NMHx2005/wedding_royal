import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HoSoClient from "./HoSoClient";

export const metadata = { title: "Hồ sơ thiệp cưới" };

export default async function HoSoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, bride_name, groom_name, wedding_date, venue_name, love_story, hashtag")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: profiles } = card
    ? await supabase.from("bride_groom_profiles").select("*").eq("card_id", card.id)
    : { data: [] };

  return <HoSoClient card={card} profiles={profiles ?? []} />;
}
