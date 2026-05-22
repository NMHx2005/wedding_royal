import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ThongKeClient } from "@/app/dashboard/thong-ke/ThongKeClient";
import { getCardEntitlements, hasEntitlement } from "@/lib/features/get-card-entitlements";
import { getPlanConfig } from "@/lib/plans/plan-config";
import type { Plan } from "@/types";

export const metadata = { title: "Thống kê thiệp cưới" };

export default async function ThongKePage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("*")
    .eq("id", cardId)
    .maybeSingle();

  if (!card) notFound();

  const planConfig = await getPlanConfig();
  const entitlements = await getCardEntitlements(cardId);
  const plan = (card.plan ?? "basic") as Plan;
  const hasStats = hasEntitlement(entitlements, "stats", plan, planConfig, card);

  const [{ count: guestCount }, { count: wishCount }, { count: approvedWishes }] =
    await Promise.all([
      supabase.from("guests").select("*", { count: "exact", head: true }).eq("card_id", cardId),
      supabase.from("wishes").select("*", { count: "exact", head: true }).eq("card_id", cardId),
      supabase
        .from("wishes")
        .select("*", { count: "exact", head: true })
        .eq("card_id", cardId)
        .eq("is_approved", true),
    ]);

  const { data: recentWishes } = await supabase
    .from("wishes")
    .select("guest_name, message, is_approved, created_at")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <ThongKeClient
      hasStats={hasStats}
      plan={plan}
      stats={{
        viewCount: card.view_count ?? 0,
        guestCount: guestCount ?? 0,
        wishCount: wishCount ?? 0,
        approvedWishes: approvedWishes ?? 0,
        status: card.status,
        slug: card.slug,
      }}
      recentWishes={recentWishes ?? []}
    />
  );
}
