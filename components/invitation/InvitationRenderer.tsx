"use client";

import { ClassicWhite } from "@/components/invitation/templates/ClassicWhite";
import { GoldenLuxury } from "@/components/invitation/templates/GoldenLuxury";
import { MinimalModern } from "@/components/invitation/templates/MinimalModern";
import type { TemplateProps } from "@/components/invitation/InvitationSections";

const TEMPLATES = {
  "classic-white": ClassicWhite,
  "golden-luxury": GoldenLuxury,
  "minimal-modern": MinimalModern,
} as const;

export function InvitationRenderer(props: TemplateProps) {
  const Template = TEMPLATES[props.card.template_id as keyof typeof TEMPLATES] ?? ClassicWhite;
  return <Template {...props} />;
}
