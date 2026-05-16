import { ensureWeddingCard } from "@/app/actions/wedding-card";
import { createClient } from "@/lib/supabase/server";
import { MungCuoiClient } from "./MungCuoiClient";

export default async function MungCuoiPage() {
  const ensured = await ensureWeddingCard();
  if (!ensured.data) return <p className="text-red-600">{ensured.error}</p>;
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("gift_logs")
    .select("*")
    .eq("card_id", ensured.data.id)
    .order("created_at", { ascending: false });
  return <MungCuoiClient cardId={ensured.data.id} logs={logs ?? []} />;
}
