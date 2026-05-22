import {
  DashboardHomeClient,
  type DashboardCardItem,
  type DashboardStats,
} from "@/components/dashboard/DashboardHomeClient";
import { getCardEntitlements, hasEntitlement } from "@/lib/features/get-card-entitlements";
import { getPlanConfig } from "@/lib/plans/plan-config";
import { createClient } from "@/lib/supabase/server";
import { hasCardEditorContent } from "@/lib/editor/hasCardEditorContent";
import { getContentJsonKind } from "@/lib/editor/contentJsonKind";
import type { Plan, WeddingCard } from "@/types";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: cardsRaw } = await supabase
    .from("wedding_cards")
    .select(
      "id, slug, plan, status, bride_name, groom_name, wedding_date, created_at, cover_image_url, view_count, paid_at, content_json"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const cardList = (cardsRaw ?? []) as Pick<
    WeddingCard,
    | "id"
    | "slug"
    | "plan"
    | "status"
    | "bride_name"
    | "groom_name"
    | "wedding_date"
    | "created_at"
    | "cover_image_url"
    | "view_count"
    | "paid_at"
    | "content_json"
  >[];

  const cardIds = cardList.map((c) => c.id);

  let guestCount = 0;
  let wishCount = 0;

  if (cardIds.length > 0) {
    const [{ count: guests }, { count: wishes }] = await Promise.all([
      supabase.from("guests").select("*", { count: "exact", head: true }).in("card_id", cardIds),
      supabase.from("wishes").select("*", { count: "exact", head: true }).in("card_id", cardIds),
    ]);
    guestCount = guests ?? 0;
    wishCount = wishes ?? 0;
  }

  const stats: DashboardStats = {
    totalCards: cardList.length,
    publicCards: cardList.filter((c) => c.status === "active").length,
    activeCards: cardList.filter((c) => c.status === "active").length,
    totalViews: cardList.reduce((sum, c) => sum + (c.view_count ?? 0), 0),
    guestCount,
    wishCount,
  };

  const planConfig = await getPlanConfig();
  const primaryPlan = (cardList[0]?.plan ?? "basic") as Plan;
  const maxCards = planConfig[primaryPlan]?.max_cards ?? 1;

  const cards: DashboardCardItem[] = await Promise.all(
    cardList.map(async (c) => {
      const entitlements = await getCardEntitlements(c.id);
      const hasStats = hasEntitlement(
        entitlements,
        "stats",
        c.plan as Plan,
        planConfig,
        c as WeddingCard
      );
      return {
        id: c.id,
        slug: c.slug,
        plan: c.plan as Plan,
        status: c.status,
        brideName: c.bride_name,
        groomName: c.groom_name,
        weddingDate: c.wedding_date,
        createdAt: c.created_at,
        coverImageUrl: c.cover_image_url,
        viewCount: c.view_count ?? 0,
        hasStats,
        hasEditorContent: hasCardEditorContent(c.content_json),
        isRawHtml: getContentJsonKind(c.content_json) === "raw-html",
      };
    })
  );

  const hasStatsPrimary = cards.length > 0 ? cards[0].hasStats : false;

  return (
    <DashboardHomeClient
      plan={primaryPlan}
      stats={stats}
      hasStats={hasStatsPrimary}
      cards={cards}
      maxCards={maxCards}
    />
  );
}
