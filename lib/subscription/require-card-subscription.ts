import type { SupabaseClient } from "@supabase/supabase-js";
import { SUBSCRIPTION_REQUIRED_MESSAGE } from "@/lib/subscription/messages";
import { hasActiveSubscription } from "@/lib/plans/plan-access";
import { getPlanConfig } from "@/lib/plans/plan-config";
import type { Plan } from "@/types";

/** Verify the current user owns the card and has an active subscription (paid or admin). */
export async function requireCardSubscription(
  supabase: SupabaseClient,
  cardId: string
): Promise<{ ok: true; plan: Plan } | { ok: false; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return { ok: true, plan: "vip" as Plan };
  }

  const { data: card, error } = await supabase
    .from("wedding_cards")
    .select("plan, paid_at, user_id")
    .eq("id", cardId)
    .maybeSingle();

  if (error || !card || card.user_id !== user.id) {
    return { ok: false, error: "Không tìm thấy thiệp" };
  }

  const planConfig = await getPlanConfig();
  if (!hasActiveSubscription({ plan: card.plan as Plan, paid_at: card.paid_at }, planConfig)) {
    return { ok: false, error: SUBSCRIPTION_REQUIRED_MESSAGE };
  }

  return { ok: true, plan: card.plan as Plan };
}
