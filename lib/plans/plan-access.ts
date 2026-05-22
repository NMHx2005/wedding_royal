import type { PlanConfigMap } from "@/lib/plans/plan-config-shared";
import { isCardSubscriptionActive } from "@/lib/plans/is-card-subscription-active";
import { planRank } from "@/lib/utils";
import type { Plan } from "@/types";

type CardPlanState = {
  plan: Plan;
  paid_at: string | null;
};

/** User đã trả phí (hoặc gói hiện tại có giá 0 trong config). */
export function hasActiveSubscription(
  card: CardPlanState | null | undefined,
  planConfig: PlanConfigMap
): boolean {
  return isCardSubscriptionActive(card, planConfig);
}

/** Gói thiệp / template yêu cầu `required` — user phải có subscription + rank đủ. */
export function planMeetsRequirement(currentPlan: Plan, required: Plan): boolean {
  return planRank(currentPlan) >= planRank(required);
}

/** Kiểm tra trước khi tạo đơn PayOS gói plan. */
export function validatePlanPurchase(
  card: CardPlanState,
  targetPlan: Plan,
  planConfig: PlanConfigMap
): { ok: true } | { ok: false; error: string } {
  const price = planConfig[targetPlan]?.price ?? 0;
  if (price <= 0) {
    return { ok: false, error: "Gói này đang miễn phí — liên hệ hỗ trợ để kích hoạt" };
  }

  if (!card.paid_at) {
    return { ok: true };
  }

  if (planRank(targetPlan) <= planRank(card.plan)) {
    return {
      ok: false,
      error: "Bạn đã có gói này hoặc gói cao hơn. Chỉ có thể nâng cấp lên gói trên.",
    };
  }

  return { ok: true };
}
