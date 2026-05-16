"use client";

import type { ReactNode } from "react";
import type { Plan } from "@/types";
import { planRank } from "@/lib/utils";
import Link from "next/link";
import { Lock } from "lucide-react";

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
        <p className="text-sm font-medium text-neutral-800">Tính năng {requiredPlan.toUpperCase()}</p>
        <Link
          href="/dashboard/goi-dich-vu"
          className="pointer-events-auto rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white"
        >
          Nâng cấp gói
        </Link>
      </div>
    </div>
  );
}
