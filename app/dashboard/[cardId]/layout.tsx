import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { canOpenVisualEditor, getContentJsonKind } from "@/lib/editor/contentJsonKind";
import type { Plan } from "@/types";

export default async function CardDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ cardId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { cardId } = await params;

  const [{ data: profile }, { data: card }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
    supabase
      .from("wedding_cards")
      .select("id, slug, plan, paid_at, bride_name, groom_name, content_json")
      .eq("id", cardId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!card) notFound();

  const isAdmin = profile?.role === "admin";

  if (isAdmin && (card.plan !== "vip" || !card.paid_at)) {
    await supabase
      .from("wedding_cards")
      .update({ plan: "vip", paid_at: new Date().toISOString() })
      .eq("id", card.id);
  }

  const effectivePlan: Plan = isAdmin ? "vip" : ((card.plan as Plan) ?? "basic");
  const cardName = `${card.groom_name} & ${card.bride_name}`;

  return (
    <DashboardChrome
      userEmail={user.email ?? ""}
      fullName={profile?.full_name ?? null}
      cardId={card.id}
      plan={effectivePlan}
      slug={card.slug}
      mode="card"
      cardName={cardName}
      canOpenVisualEditor={canOpenVisualEditor(card.content_json)}
      invitationContentKind={getContentJsonKind(card.content_json)}
    >
      {children}
    </DashboardChrome>
  );
}
