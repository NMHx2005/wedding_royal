import { createClient } from "@/lib/supabase/server";
import { userHasActiveSubscription } from "@/lib/plans/is-card-subscription-active";
import { getPlanConfig } from "@/lib/plans/plan-config";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import type { Plan } from "@/types";

export default async function DashboardHomeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: cards }, planConfig] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
    supabase.from("wedding_cards").select("paid_at, plan").eq("user_id", user.id),
    getPlanConfig(),
  ]);

  const isAdmin = profile?.role === "admin";
  const effectivePlan: Plan = isAdmin ? "vip" : "basic";
  const subscriptionActive = isAdmin || userHasActiveSubscription(cards ?? [], planConfig);

  return (
    <DashboardChrome
      userEmail={user.email ?? ""}
      fullName={profile?.full_name ?? null}
      cardId={null}
      plan={effectivePlan}
      slug={null}
      mode="home"
      subscriptionActive={subscriptionActive}
    >
      {children}
    </DashboardChrome>
  );
}
