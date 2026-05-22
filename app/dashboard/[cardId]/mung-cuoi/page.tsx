import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MungCuoiClient } from "@/app/dashboard/mung-cuoi/MungCuoiClient";

export const metadata = { title: "Mừng cưới" };

export default async function MungCuoiPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id")
    .eq("id", cardId)
    .maybeSingle();

  if (!card) notFound();

  const { data: logs } = await supabase
    .from("gift_logs")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  return <MungCuoiClient cardId={cardId} logs={logs ?? []} />;
}
