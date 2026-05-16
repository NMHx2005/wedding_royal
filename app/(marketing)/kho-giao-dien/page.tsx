import { createPublicSupabase } from "@/lib/supabase/public";
import { getFaqItems } from "@/lib/data/faq-items";
import { STATIC_TEMPLATES } from "@/lib/data/marketing-templates";
import { KhoGiaoDienClient } from "./KhoGiaoDienClient";

export default async function KhoGiaoDienPage() {
  let templates = STATIC_TEMPLATES;
  try {
    const supabase = createPublicSupabase();
    const { data } = await supabase.from("templates").select("*").eq("is_active", true).order("sort_order");
    if (data && data.length > 0) templates = data as typeof STATIC_TEMPLATES;
  } catch {
    /* static */
  }
  const faqItems = await getFaqItems();
  return <KhoGiaoDienClient templates={templates} faqItems={faqItems} />;
}
