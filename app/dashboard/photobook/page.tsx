import { createClient } from "@/lib/supabase/server";
import { getPlanConfig } from "@/lib/plans/plan-config";
import { redirect } from "next/navigation";
import type { Plan } from "@/types";
import PhotobookClient from "./PhotobookClient";

export const metadata = { title: "Quản lý Photobook" };

export default async function PhotobookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, plan")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: photos } = card
    ? await supabase
        .from("wedding_photos")
        .select("*")
        .eq("card_id", card.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  const plan = (card?.plan ?? "basic") as Plan;
  const planConfig = await getPlanConfig();
  const photoLimit = planConfig[plan].max_photos;

  return (
    <PhotobookClient
      cardId={card?.id ?? null}
      plan={plan}
      photoLimit={photoLimit}
      photobookEnabled={planConfig[plan].features.photobook}
      initialPhotos={photos ?? []}
    />
  );
}
