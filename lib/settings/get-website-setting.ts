import { createPublicSupabase } from "@/lib/supabase/public";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function getWebsiteSetting<T>(key: string, fallback: T, serviceRole = false): Promise<T> {
  const supabase = serviceRole ? createServiceRoleClient() : createPublicSupabase();
  const { data } = await supabase.from("website_settings").select("value").eq("key", key).maybeSingle();
  if (!data?.value) return fallback;
  if (typeof fallback === "object" && fallback !== null && !Array.isArray(fallback)) {
    return { ...fallback, ...(data.value as Partial<T>) } as T;
  }
  return data.value as T;
}
