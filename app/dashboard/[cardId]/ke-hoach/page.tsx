import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KeHoachClient from "@/app/dashboard/ke-hoach/KeHoachClient";

export const metadata = { title: "Kế hoạch cưới" };

export default async function KeHoachPage({
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

  return <KeHoachClient cardId={cardId} />;
}
