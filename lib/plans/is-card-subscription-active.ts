import type { PlanConfigMap } from "@/lib/plans/plan-config-shared";
import type { Plan, WeddingCard } from "@/types";

type CardLike = Pick<WeddingCard, "paid_at" | "plan">;

/** True when user may use paid dashboard features (paid or tier configured as free). */
export function isCardSubscriptionActive(
  card: CardLike | null | undefined,
  planConfig: PlanConfigMap
): boolean {
  if (!card) return false;
  if (card.paid_at) return true;
  const tier = card.plan as Plan;
  const price = planConfig[tier]?.price ?? 0;
  return price <= 0;
}

export function tierRequiresPayment(planConfig: PlanConfigMap, plan: Plan): boolean {
  return (planConfig[plan]?.price ?? 0) > 0;
}

/** True if the user has at least one card with an active subscription (any card paid or free tier). */
export function userHasActiveSubscription(
  cards: CardLike[] | null | undefined,
  planConfig: PlanConfigMap
): boolean {
  if (!cards?.length) return false;
  return cards.some((c) => isCardSubscriptionActive(c, planConfig));
}
