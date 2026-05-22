import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PhotobookClient from "@/app/dashboard/photobook/PhotobookClient";
import { getCardEntitlements, hasEntitlement } from "@/lib/features/get-card-entitlements";
import { getPlanConfig } from "@/lib/plans/plan-config";
import type { Plan } from "@/types";

export const metadata = { title: "Quản lý Photobook" };

export default async function PhotobookPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, plan, paid_at")
    .eq("id", cardId)
    .maybeSingle();

  if (!card) notFound();

  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("card_id", cardId)
    .order("sort_order", { ascending: true });

  const plan = (card.plan ?? "basic") as Plan;
  const planConfig = await getPlanConfig();
  const entitlements = await getCardEntitlements(cardId);
  const photobookEnabled = hasEntitlement(entitlements, "photobook", plan, planConfig, card);
  const photoLimit = planConfig[plan].max_photos;

  return (
    <PhotobookClient
      cardId={cardId}
      plan={plan}
      photoLimit={photoLimit}
      photobookEnabled={photobookEnabled}
      initialPhotos={photos ?? []}
    />
  );
}
