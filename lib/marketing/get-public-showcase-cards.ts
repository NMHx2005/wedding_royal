import { couplesShowcase } from "@/lib/data/mehappy-landing";
import type { CoupleShowcaseItem } from "@/lib/marketing/types";
import { createPublicSupabase } from "@/lib/supabase/public";

const FALLBACK_COVER =
  "https://s3-hcm-r2.s3cloud.vn/thiepcuoi-mehappy/users/1928/67d91017-be4f-46d2-95e3-95283716d77d-full.webp";

function formatWeddingDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

type TemplateJoin = {
  name: string | null;
  thumbnail_url: string | null;
  plan_required: string | null;
};

type CardRow = {
  id: string;
  slug: string;
  bride_name: string | null;
  groom_name: string | null;
  wedding_date: string | null;
  plan: string | null;
  cover_image_url: string | null;
  view_count: number | null;
  template_id: string | null;
  templates?: TemplateJoin | TemplateJoin[] | null;
};

function resolveTemplate(join: CardRow["templates"]): TemplateJoin | null {
  if (!join) return null;
  if (Array.isArray(join)) return join[0] ?? null;
  return join;
}

function rowToShowcaseItem(row: CardRow): CoupleShowcaseItem {
  const tpl = resolveTemplate(row.templates);
  const bride = row.bride_name?.trim() || "Cô dâu";
  const groom = row.groom_name?.trim() || "Chú rể";
  const tplName = tpl?.name;
  const planLabel = (row.plan ?? "basic").toUpperCase();
  const meta = tplName ? `Mẫu: ${tplName} — Gói ${planLabel}` : `Gói ${planLabel}`;

  return {
    id: row.slug || row.id,
    image: row.cover_image_url ?? tpl?.thumbnail_url ?? FALLBACK_COVER,
    title: `Đám cưới ${groom} & ${bride}`,
    date: formatWeddingDate(row.wedding_date),
    meta,
    invitationUrl: `/thiep/${row.slug}`,
  };
}

/** Active public invitations; merges with static fallback when DB empty. */
export async function getPublicShowcaseCards(limit = 60): Promise<CoupleShowcaseItem[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("wedding_cards")
      .select(
        "id, slug, bride_name, groom_name, wedding_date, plan, cover_image_url, view_count, template_id, templates(name, thumbnail_url, plan_required)"
      )
      .eq("status", "active")
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const fromDb = (data ?? []).map((row) => rowToShowcaseItem(row as unknown as CardRow));
    if (fromDb.length > 0) return fromDb;
  } catch {
    /* fallback below */
  }

  return [...couplesShowcase];
}
