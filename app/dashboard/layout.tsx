import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import type { Plan } from "@/types";

export const metadata = {
  title: "Wedding Manager | meWedding",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, slug, plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <DashboardChrome
      userEmail={user.email ?? ""}
      fullName={profile?.full_name ?? null}
      cardId={card?.id ?? null}
      plan={(card?.plan as Plan) ?? "basic"}
      slug={card?.slug ?? null}
    >
      {children}
    </DashboardChrome>
  );
}
