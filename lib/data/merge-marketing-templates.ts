import { LEGACY_MARKETING_TEMPLATE_IDS } from "@/lib/data/legacy-template-ids";
import type { TemplateRow } from "@/types";

const legacyIds = new Set<string>(LEGACY_MARKETING_TEMPLATE_IDS);

function isMarketingTemplate(t: TemplateRow): boolean {
  if (t.is_active === false) return false;
  if (legacyIds.has(t.id)) return false;
  return true;
}

/** Gộp mẫu Craft từ DB + fallback tĩnh (ưu tiên DB theo id; bỏ legacy React templates). */
export function mergeMarketingTemplates(
  fromDb: TemplateRow[],
  fallback: TemplateRow[]
): TemplateRow[] {
  const map = new Map<string, TemplateRow>();
  for (const t of fallback) {
    if (isMarketingTemplate(t)) map.set(t.id, t);
  }
  for (const t of fromDb) {
    if (isMarketingTemplate(t)) map.set(t.id, { ...map.get(t.id), ...t });
  }
  return Array.from(map.values()).sort(
    (a, b) => (b.sort_order ?? 0) - (a.sort_order ?? 0)
  );
}
