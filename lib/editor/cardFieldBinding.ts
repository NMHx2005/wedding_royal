import type { WeddingCard } from "@/types";
import { isCraftContentJson } from "@/lib/editor/sanitizeCraftContent";

export type CardTextField = "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address";

type ContentNode = {
  type?: { resolvedName?: string };
  props?: Record<string, unknown>;
};

/** `datetime-local` value in the user's local timezone. */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** YYYY-MM-DD in local timezone (matches premium template date text style). */
export function formatWeddingDateIsoLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function resolveCardFieldValue(
  card: Pick<WeddingCard, "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address">,
  field: CardTextField
): string {
  switch (field) {
    case "wedding_date":
      return formatWeddingDateIsoLocal(card.wedding_date);
    case "bride_name":
      return card.bride_name ?? "";
    case "groom_name":
      return card.groom_name ?? "";
    case "venue_name":
      return card.venue_name ?? "";
    case "venue_address":
      return card.venue_address ?? "";
    default:
      return "";
  }
}

function inferCardField(props: Record<string, unknown>): CardTextField | undefined {
  const explicit = props.cardField as CardTextField | undefined;
  if (explicit) return explicit;

  const id = String(props.elementId ?? "");
  if (id === "s2-date-iso" || /wedding-date/i.test(id)) return "wedding_date";
  if (/groom-name/i.test(id)) return "groom_name";
  if (/bride-name/i.test(id)) return "bride_name";
  if (/venue-name/i.test(id)) return "venue_name";
  if (/venue-address/i.test(id)) return "venue_address";
  return undefined;
}

/** Tag TextBlock nodes that should follow wedding_cards fields. */
export function migrateCardFieldBindings(content: Record<string, unknown>): Record<string, unknown> {
  const next = { ...content };
  for (const [key, node] of Object.entries(next)) {
    if (!node || typeof node !== "object") continue;
    const n = node as ContentNode;
    if (n.type?.resolvedName !== "TextBlock" || !n.props) continue;
    const field = inferCardField(n.props);
    if (field && n.props.cardField !== field) {
      next[key] = { ...n, props: { ...n.props, cardField: field } };
    }
  }
  return next;
}

/** Write resolved card field values into TextBlock `content` (for editor JSON + DB). */
export function syncCardFieldsInContent(
  content: Record<string, unknown>,
  card: Pick<WeddingCard, "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address">
): Record<string, unknown> {
  if (!isCraftContentJson(content)) return content;
  const bound = migrateCardFieldBindings(content);
  const next = { ...bound };
  for (const [key, node] of Object.entries(next)) {
    if (!node || typeof node !== "object") continue;
    const n = node as ContentNode;
    if (n.type?.resolvedName !== "TextBlock" || !n.props) continue;
    const field = inferCardField(n.props);
    if (!field) continue;
    const value = resolveCardFieldValue(card, field);
    if (n.props.content !== value) {
      next[key] = { ...n, props: { ...n.props, content: value, cardField: field } };
    }
  }
  return next;
}

export function patchNeedsCardFieldSync(patch: Record<string, unknown>): boolean {
  return ["wedding_date", "bride_name", "groom_name", "venue_name", "venue_address"].some(
    (k) => k in patch
  );
}

function plainTextFromContent(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Parse wedding date from plain text (YYYY-MM-DD or DD/MM/YYYY). */
export function parseWeddingDateFromPlainText(raw: string): string | undefined {
  const trimmed = raw.trim();
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  const vn = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (vn) {
    const d = new Date(Number(vn[3]), Number(vn[2]) - 1, Number(vn[1]), 12, 0, 0);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return undefined;
}

type CardFieldPatch = Partial<
  Pick<WeddingCard, "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address">
>;

/** Map one bound TextBlock plain text → wedding_cards column patch. */
export function cardFieldPatchFromPlain(field: CardTextField, raw: string): CardFieldPatch | null {
  if (!raw) return null;
  switch (field) {
    case "wedding_date": {
      const iso = parseWeddingDateFromPlainText(raw);
      return iso ? { wedding_date: iso } : null;
    }
    case "bride_name":
      return { bride_name: raw };
    case "groom_name":
      return { groom_name: raw };
    case "venue_name":
      return { venue_name: raw };
    case "venue_address":
      return { venue_address: raw };
    default:
      return null;
  }
}

/** Read TextBlock `content` bound via cardField → patch wedding_cards columns after editor save. */
export function extractCardFieldsFromContent(
  content: Record<string, unknown>
): Partial<
  Pick<WeddingCard, "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address">
> {
  if (!isCraftContentJson(content)) return {};
  const patch: Partial<
    Pick<WeddingCard, "wedding_date" | "bride_name" | "groom_name" | "venue_name" | "venue_address">
  > = {};

  for (const node of Object.values(content)) {
    if (!node || typeof node !== "object") continue;
    const n = node as ContentNode;
    if (n.type?.resolvedName !== "TextBlock" || !n.props) continue;
    const field = inferCardField(n.props);
    if (!field) continue;
    const raw = plainTextFromContent(String(n.props.content ?? ""));
    if (!raw) continue;

    const fieldPatch = cardFieldPatchFromPlain(field, raw);
    if (fieldPatch) Object.assign(patch, fieldPatch);
  }
  return patch;
}
