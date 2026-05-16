import { faqMehappy } from "@/lib/data/mehappy-landing";
import { getWebsiteSetting } from "@/lib/settings/get-website-setting";
import type { FaqItem } from "@/types";

export async function getFaqItems(): Promise<FaqItem[]> {
  const fromDb = await getWebsiteSetting<FaqItem[]>("faq", []);
  if (Array.isArray(fromDb) && fromDb.length > 0 && fromDb.every((i) => i.q && i.a)) {
    return fromDb;
  }
  return faqMehappy;
}
