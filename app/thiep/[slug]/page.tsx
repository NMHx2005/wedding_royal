import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createPublicSupabase } from "@/lib/supabase/public";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { TrackView } from "@/components/invitation/TrackView";
import type { WeddingCard } from "@/types";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createPublicSupabase();
  const { data: card, error } = await supabase
    .from("wedding_cards")
    .select("bride_name, groom_name, wedding_date, cover_image_url, status")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();
  if (error || !card) {
    return { title: "Thiệp cưới" };
  }
  const c = card as Pick<WeddingCard, "bride_name" | "groom_name" | "wedding_date" | "cover_image_url">;
  const dateStr = format(new Date(c.wedding_date), "dd/MM/yyyy");
  const og = c.cover_image_url ? { images: [{ url: c.cover_image_url }] } : undefined;
  return {
    title: `Thiệp cưới ${c.bride_name} & ${c.groom_name}`,
    description: `Trân trọng kính mời bạn đến dự lễ thành hôn của ${c.bride_name} & ${c.groom_name} vào ngày ${dateStr}`,
    openGraph: {
      title: `Thiệp cưới ${c.bride_name} & ${c.groom_name}`,
      description: `Ngày ${dateStr}`,
      ...og,
    },
  };
}

export default async function PublicInvitationPage({ params }: Props) {
  const supabase = createPublicSupabase();
  const { data: card, error } = await supabase
    .from("wedding_cards")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();
  if (error || !card) {
    notFound();
  }
  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("card_id", card.id)
    .order("sort_order", { ascending: true });

  return (
    <>
      <TrackView slug={params.slug} />
      <div className="mx-auto min-h-screen max-w-[480px] bg-neutral-100 shadow-xl">
        <InvitationRenderer card={card as WeddingCard} photos={photos ?? []} guest={null} />
      </div>
    </>
  );
}
