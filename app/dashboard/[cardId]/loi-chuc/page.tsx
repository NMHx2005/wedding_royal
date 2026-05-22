import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LoiChucClient } from "@/app/dashboard/loi-chuc/LoiChucClient";
import { getCardEntitlements, hasEntitlement } from "@/lib/features/get-card-entitlements";
import { getPlanConfig } from "@/lib/plans/plan-config";
import type { Plan } from "@/types";

export const metadata = { title: "Quản lý lời chúc" };

export default async function LoiChucPage({
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

  const { data: wishes } = await supabase
    .from("wishes")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  const planConfig = await getPlanConfig();
  const plan = (card.plan ?? "basic") as Plan;
  const entitlements = await getCardEntitlements(cardId);
  const hasAutoApprove = hasEntitlement(entitlements, "auto_approve_wishes", plan, planConfig, card);
  const canExportWishes = hasEntitlement(entitlements, "export_wishes", plan, planConfig, card);

  return (
    <LoiChucClient
      wishes={wishes ?? []}
      plan={plan}
      showUpsell={!hasAutoApprove}
      canExportWishes={canExportWishes}
    />
  );
}
