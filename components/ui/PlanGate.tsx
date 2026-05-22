"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import type { Plan } from "@/types";
import { SUBSCRIPTION_ACTIVATE_PATH } from "@/lib/subscription/messages";
import { planRank } from "@/lib/utils";

type Props = {
  requiredPlan: "pro" | "vip";
  currentPlan: Plan;
  children: ReactNode;
};

export function PlanGate({ requiredPlan, currentPlan, children }: Props) {
  const ok = planRank(currentPlan) >= planRank(requiredPlan);
  if (ok) {
    return <>{children}</>;
  }
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 p-4 text-center">
        <Lock className="h-8 w-8 text-mewedding-rose" />
        <p className="text-sm font-medium text-neutral-800">
          Tính năng <strong>{requiredPlan.toUpperCase()}</strong> chưa có trong gói hiện tại
        </p>
        <p className="max-w-xs text-xs text-neutral-600">
          Nâng cấp lên {requiredPlan === "vip" ? "VIP" : "Pro hoặc VIP"} để mở khóa tính năng này.
        </p>
        <Link
          href={SUBSCRIPTION_ACTIVATE_PATH}
          className="pointer-events-auto rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white"
        >
          Xem gói nâng cấp
        </Link>
      </div>
    </div>
  );
}
