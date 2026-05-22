import { STATIC_TEMPLATES } from "@/lib/data/marketing-templates";
import { mergeMarketingTemplates } from "@/lib/data/merge-marketing-templates";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { TemplateRow } from "@/types";

export async function getMarketingTemplates(): Promise<TemplateRow[]> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: false });

    if (error) throw error;
    return mergeMarketingTemplates((data ?? []) as TemplateRow[], STATIC_TEMPLATES);
  } catch {
    return mergeMarketingTemplates([], STATIC_TEMPLATES);
  }
}
