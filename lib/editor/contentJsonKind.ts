import { isCraftContentJson } from "@/lib/editor/sanitizeCraftContent";

export type ContentJsonKind = "none" | "raw-html" | "craft";

export function getContentJsonKind(content: unknown): ContentJsonKind {
  if (content == null || typeof content !== "object") return "none";
  const c = content as Record<string, unknown>;
  if (c.type === "raw-html") return "raw-html";
  if (isCraftContentJson(c)) return "craft";
  return "none";
}

/** Card can open `/dashboard/editor/[cardId]` (Craft.js visual editor). */
export function canOpenVisualEditor(content: unknown): boolean {
  return getContentJsonKind(content) === "craft";
}

/** Card has a publishable invitation design (HTML or Craft). */
export function hasPublishedInvitationDesign(content: unknown): boolean {
  const kind = getContentJsonKind(content);
  return kind === "craft" || kind === "raw-html";
}
