import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import HoSoClient from "@/app/dashboard/ho-so/HoSoClient";

export const metadata = { title: "Hồ sơ thiệp cưới" };

export default async function HoSoPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, bride_name, groom_name, wedding_date, venue_name, love_story, hashtag")
    .eq("id", cardId)
    .maybeSingle();

  if (!card) notFound();

  const { data: profiles } = await supabase
    .from("bride_groom_profiles")
    .select("*")
    .eq("card_id", card.id);

  return <HoSoClient card={card} profiles={profiles ?? []} />;
}
