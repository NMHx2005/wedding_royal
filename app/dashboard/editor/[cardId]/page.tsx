import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canOpenVisualEditor, getContentJsonKind } from "@/lib/editor/contentJsonKind";
import { EditorPageClient } from "./EditorPageClient";
import type { WeddingCard } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ cardId: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { cardId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("*")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!card) notFound();

  // Ensure the card is paid before editing
  if (!card.paid_at) {
    redirect("/dashboard/goi-dich-vu");
  }

  if (!canOpenVisualEditor(card.content_json)) {
    const source = getContentJsonKind(card.content_json) === "raw-html" ? "&source=html" : "";
    redirect(`/dashboard/${cardId}/thiet-lap?needTemplate=1${source}`);
  }

  return <EditorPageClient card={card as WeddingCard} />;
}
