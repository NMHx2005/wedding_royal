import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ThietLapPage({
  searchParams,
}: {
  searchParams: Promise<{ cardId?: string; template?: string; needTemplate?: string; source?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { cardId, template, needTemplate, source } = await searchParams;

  let q = supabase.from("wedding_cards").select("id").eq("user_id", user.id);
  if (cardId) q = q.eq("id", cardId);
  const { data: card } = await q.order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (!card) redirect("/dashboard");

  const params = new URLSearchParams();
  if (template) params.set("template", template);
  if (needTemplate) params.set("needTemplate", needTemplate);
  if (source) params.set("source", source);
  const qs = params.toString();
  redirect(`/dashboard/${card.id}/thiet-lap${qs ? `?${qs}` : ""}`);
}
