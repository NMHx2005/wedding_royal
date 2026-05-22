"use client";

import type { ReactNode } from "react";
import type { WeddingCard } from "@/types";
import { BackgroundMusic } from "@/components/invitation/BackgroundMusic";
import { ConfettiEffect } from "@/components/invitation/ConfettiEffect";
import { InvitationAutoScroll } from "@/components/invitation/InvitationAutoScroll";

type Props = {
  card: WeddingCard;
  children: ReactNode;
};

/** Wraps invitation content with site-wide music + confetti (Craft.js and legacy templates). */
export function InvitationExperience({ card, children }: Props) {
  return (
    <>
      <ConfettiEffect type={card.confetti_effect} />
      <BackgroundMusic src={card.background_music_url} />
      <InvitationAutoScroll />
      {children}
    </>
  );
}
