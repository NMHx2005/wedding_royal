import { migrateContentJson } from "@/lib/editor/migrateContentJson";
import { isCraftContentJson, sanitizeCraftContent } from "@/lib/editor/sanitizeCraftContent";

/**
 * Normalize Craft JSON before persisting.
 * Does NOT sync cardField text from DB — that would overwrite editor changes on every save.
 * Thiết lập updates still sync via updateWeddingCard → syncCardFieldsInContent.
 */
export function prepareContentForSave(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitized = sanitizeCraftContent(raw);
  if (!isCraftContentJson(sanitized)) return sanitized;
  return migrateContentJson(sanitized);
}
