import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChiTieuClient from "@/app/dashboard/chi-tieu/ChiTieuClient";

export const metadata = { title: "Quản lý chi tiêu" };

export default async function ChiTieuPage({
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

  return <ChiTieuClient cardId={cardId} />;
}
