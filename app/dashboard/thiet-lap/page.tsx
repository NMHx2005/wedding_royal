import { ensureWeddingCard } from "@/app/actions/wedding-card";
import { createClient } from "@/lib/supabase/server";
import { ThietLapForm } from "./ThietLapForm";

export default async function ThietLapPage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const ensured = await ensureWeddingCard();
  if (!ensured.data) {
    return <p className="text-red-600">{ensured.error}</p>;
  }
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("card_id", ensured.data.id)
    .order("sort_order", { ascending: true });

  return (
    <ThietLapForm
      card={ensured.data}
      photos={photos ?? []}
      initialTemplateFromQuery={searchParams.template}
    />
  );
}
