import type { PayablePlan } from "@/lib/payos";
import { getPlanConfig } from "@/lib/plans/plan-config";

export type PlanPriceInfo = {
  name: string;
  price: number;
  description: string;
};

export type PlanPricesMap = Record<PayablePlan, PlanPriceInfo>;

export async function getPlanPrices(serviceRole = false): Promise<PlanPricesMap> {
  const config = await getPlanConfig(serviceRole);
  return {
    pro: {
      name: config.pro.name,
      price: config.pro.price,
      description: config.pro.description,
    },
    vip: {
      name: config.vip.name,
      price: config.vip.price,
      description: config.vip.description,
    },
  };
}
