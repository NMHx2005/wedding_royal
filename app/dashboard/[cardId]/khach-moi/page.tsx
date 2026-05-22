import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import KhachMoiClient from "@/app/dashboard/khach-moi/KhachMoiClient";

export const metadata = { title: "Quản lý khách mời" };

export default async function KhachMoiPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id, plan, slug")
    .eq("id", cardId)
    .maybeSingle();

  if (!card) notFound();

  const [{ data: guests }, { data: groups }] = await Promise.all([
    supabase.from("guests").select("*").eq("card_id", cardId).order("created_at"),
    supabase.from("guest_groups").select("*").eq("card_id", cardId).order("created_at"),
  ]);

  return (
    <KhachMoiClient
      card={card}
      initialGuests={guests ?? []}
      initialGroups={groups ?? []}
    />
  );
}
