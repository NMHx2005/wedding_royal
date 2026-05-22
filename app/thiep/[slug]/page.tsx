import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { InvitationPreviewBanner } from "@/components/invitation/InvitationPreviewBanner";
import { TrackView } from "@/components/invitation/TrackView";
import {
  fetchInvitationCard,
  fetchInvitationPhotos,
} from "@/lib/invitation/fetchInvitationCard";
import type { WeddingCard } from "@/types";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await fetchInvitationCard(params.slug);
  if (!result) {
    return { title: "Thiệp cưới" };
  }
  const card = result.card;
  const dateStr = format(new Date(card.wedding_date), "dd/MM/yyyy");
  const og = card.cover_image_url ? { images: [{ url: card.cover_image_url }] } : undefined;
  const title = result.isOwnerPreview
    ? `[Xem trước] ${card.bride_name} & ${card.groom_name}`
    : `Thiệp cưới ${card.bride_name} & ${card.groom_name}`;
  return {
    title,
    description: `Trân trọng kính mời bạn đến dự lễ thành hôn của ${card.bride_name} & ${card.groom_name} vào ngày ${dateStr}`,
    robots: result.isOwnerPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: `Ngày ${dateStr}`,
      ...og,
    },
  };
}

export default async function PublicInvitationPage({ params }: Props) {
  const result = await fetchInvitationCard(params.slug);
  if (!result) {
    notFound();
  }

  const { card, isOwnerPreview } = result;
  const photos = await fetchInvitationPhotos(card.id);

  return (
    <>
      {isOwnerPreview && <InvitationPreviewBanner />}
      {!isOwnerPreview && <TrackView slug={params.slug} />}
      <InvitationRenderer
        card={card as WeddingCard}
        photos={photos}
        guest={null}
      />
    </>
  );
}
