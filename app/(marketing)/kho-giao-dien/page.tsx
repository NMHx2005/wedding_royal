import { getFaqItems } from "@/lib/data/faq-items";
import { getMarketingTemplates } from "@/lib/marketing/get-marketing-templates";
import { KhoGiaoDienClient } from "./KhoGiaoDienClient";

export default async function KhoGiaoDienPage() {
  const [templates, faqItems] = await Promise.all([getMarketingTemplates(), getFaqItems()]);
  return <KhoGiaoDienClient templates={templates} faqItems={faqItems} />;
}
