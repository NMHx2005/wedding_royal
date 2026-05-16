import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_PLAN_CONFIG,
  type PlanConfigMap,
  type PlanFeatureKey,
  planHasFeature,
} from "@/lib/plans/plan-config-shared";
import type { Plan } from "@/types";

export async function getCardEntitlements(cardId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("wedding_card_feature_entitlements")
    .select("feature_key")
    .eq("card_id", cardId);
  return (data ?? []).map((r) => r.feature_key);
}

/** Purchased features apply to this card only (not all cards of the user). */
export function hasEntitlement(
  entitlements: string[],
  key: string,
  plan: string,
  planConfig: PlanConfigMap = DEFAULT_PLAN_CONFIG
): boolean {
  if (entitlements.includes(key)) return true;
  const tier = plan as Plan;
  const featureKey = key as PlanFeatureKey;
  if (featureKey in planConfig[tier].features) {
    return planHasFeature(planConfig, tier, featureKey);
  }
  return false;
}
