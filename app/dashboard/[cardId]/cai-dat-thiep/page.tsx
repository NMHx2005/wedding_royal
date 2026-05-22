import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CaiDatThiepClient from "@/app/dashboard/cai-dat-thiep/CaiDatThiepClient";
import type { TemplateRow, WeddingCard } from "@/types";

export const metadata = { title: "Cài đặt thiệp cưới" };

export default async function CaiDatThiepPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const [{ data: card }, { data: profile }, { data: templates }] = await Promise.all([
    supabase.from("wedding_cards").select("*").eq("id", cardId).maybeSingle(),
    supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle(),
    supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!card) notFound();

  const isAdmin = profile?.role === "admin";
  const effectiveCard: WeddingCard = isAdmin
    ? { ...(card as WeddingCard), plan: "vip", paid_at: card.paid_at ?? new Date().toISOString() }
    : (card as WeddingCard);

  return (
    <CaiDatThiepClient
      key={cardId}
      card={effectiveCard}
      templates={(templates ?? []) as TemplateRow[]}
    />
  );
}
