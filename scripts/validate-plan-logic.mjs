/**
 * Kiểm tra logic gói (không cần DB). Chạy: node scripts/validate-plan-logic.mjs
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Inline copy of logic under test (keep in sync with lib/plans/plan-access.ts)
function planRank(plan) {
  if (plan === "vip") return 3;
  if (plan === "pro") return 2;
  return 1;
}

function isCardSubscriptionActive(card, planConfig) {
  if (!card) return false;
  if (card.paid_at) return true;
  const price = planConfig[card.plan]?.price ?? 0;
  return price <= 0;
}

function userHasActiveSubscription(cards, planConfig) {
  if (!cards?.length) return false;
  return cards.some((c) => isCardSubscriptionActive(c, planConfig));
}

function validatePlanPurchase(card, targetPlan, planConfig) {
  const price = planConfig[targetPlan]?.price ?? 0;
  if (price <= 0) return { ok: false, error: "free" };
  if (!card.paid_at) return { ok: true };
  if (planRank(targetPlan) <= planRank(card.plan)) {
    return { ok: false, error: "downgrade" };
  }
  return { ok: true };
}

const planConfig = {
  basic: { price: 198000 },
  pro: { price: 199000 },
  vip: { price: 399000 },
};

const tests = [
  {
    name: "Chưa trả — mua Basic",
    card: { plan: "basic", paid_at: null },
    target: "basic",
    expect: true,
  },
  {
    name: "Chưa trả — mua thẳng VIP",
    card: { plan: "basic", paid_at: null },
    target: "vip",
    expect: true,
  },
  {
    name: "Đã Basic — mua lại Basic",
    card: { plan: "basic", paid_at: "2026-01-01" },
    target: "basic",
    expect: false,
  },
  {
    name: "Đã Basic — nâng Pro",
    card: { plan: "basic", paid_at: "2026-01-01" },
    target: "pro",
    expect: true,
  },
  {
    name: "Đã VIP — mua Basic",
    card: { plan: "vip", paid_at: "2026-01-01" },
    target: "basic",
    expect: false,
  },
  {
    name: "Không card — không active",
    card: null,
    target: "basic",
    check: "active",
    expect: false,
  },
  {
    name: "Đã trả — active",
    card: { plan: "pro", paid_at: "2026-01-01" },
    check: "active",
    expect: true,
  },
  {
    name: "Đa thiệp — thiệp 1 chưa trả, thiệp 2 đã trả",
    cards: [
      { plan: "basic", paid_at: null },
      { plan: "pro", paid_at: "2026-01-01" },
    ],
    check: "userActive",
    expect: true,
  },
  {
    name: "Đa thiệp — cả hai chưa trả",
    cards: [
      { plan: "basic", paid_at: null },
      { plan: "basic", paid_at: null },
    ],
    check: "userActive",
    expect: false,
  },
  {
    name: "Không có thiệp — userActive",
    cards: [],
    check: "userActive",
    expect: false,
  },
];

let failed = 0;
for (const t of tests) {
  let pass;
  if (t.check === "userActive") {
    pass = userHasActiveSubscription(t.cards, planConfig) === t.expect;
  } else if (t.check === "active") {
    pass = isCardSubscriptionActive(t.card, planConfig) === t.expect;
  } else {
    const r = validatePlanPurchase(t.card, t.target, planConfig);
    pass = r.ok === t.expect;
  }
  if (!pass) {
    console.error("FAIL:", t.name);
    failed++;
  } else {
    console.log("OK:", t.name);
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nAll plan logic checks passed.");
