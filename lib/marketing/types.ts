/** Carousel item on marketing home / kho giao dien. */
export type TemplateShowcaseItem = {
  id: string;
  image: string;
  title: string;
  desc: string;
  tags: string[];
  tier: "basic" | "pro" | "vip";
  hot?: boolean;
  newHot?: boolean;
  previewHref: string;
};

/** Public active wedding card for community gallery. */
export type CoupleShowcaseItem = {
  id: string;
  image: string;
  title: string;
  date: string;
  meta: string;
  invitationUrl: string;
};
