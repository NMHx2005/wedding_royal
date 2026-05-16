import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createPublicSupabase } from "@/lib/supabase/public";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { TrackView } from "@/components/invitation/TrackView";
import type { Guest, WeddingCard } from "@/types";

type Props = { params: { slug: string; guestToken: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createPublicSupabase();
  const { data: card } = await supabase
    .from("wedding_cards")
    .select("bride_name, groom_name, wedding_date, cover_image_url, status")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();
  if (!card) return { title: "Thiệp cưới" };
  const c = card as Pick<WeddingCard, "bride_name" | "groom_name" | "wedding_date" | "cover_image_url">;
  const dateStr = format(new Date(c.wedding_date), "dd/MM/yyyy");
  return {
    title: `Thiệp cưới ${c.bride_name} & ${c.groom_name}`,
    description: `Kính mời — ${dateStr}`,
    openGraph: {
      title: `Thiệp cưới ${c.bride_name} & ${c.groom_name}`,
      ...(c.cover_image_url ? { images: [{ url: c.cover_image_url }] } : {}),
    },
  };
}

export default async function GuestInvitationPage({ params }: Props) {
  const supabase = createPublicSupabase();
  const { data: card, error: cErr } = await supabase
    .from("wedding_cards")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "active")
    .maybeSingle();
  if (cErr || !card) notFound();

  let guest: Guest | null = null;
  try {
    const admin = createServiceRoleClient();
    const { data: g } = await admin
      .from("guests")
      .select("*")
      .eq("card_id", card.id)
      .eq("token", params.guestToken)
      .maybeSingle();
    guest = g as Guest | null;
  } catch {
    guest = null;
  }
  if (!guest) notFound();

  const { data: photos } = await supabase
    .from("wedding_photos")
    .select("*")
    .eq("card_id", card.id)
    .order("sort_order", { ascending: true });

  return (
    <>
      <TrackView slug={params.slug} />
      <div className="mx-auto min-h-screen max-w-[480px] bg-neutral-100 shadow-xl">
        <InvitationRenderer card={card as WeddingCard} photos={photos ?? []} guest={guest} />
      </div>
    </>
  );
}
