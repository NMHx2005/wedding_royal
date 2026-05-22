"use server";

import { createClient } from "@/lib/supabase/server";

export interface SavedTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  content_json: Record<string, unknown>;
  created_at: string;
}

export async function saveTemplate(
  name: string,
  category: string,
  contentJson: Record<string, unknown>
): Promise<{ data: SavedTemplate | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const { data, error } = await supabase
    .from("saved_templates")
    .insert({ user_id: user.id, name, category, content_json: contentJson })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as SavedTemplate, error: null };
}

export async function getSavedTemplates(): Promise<{ data: SavedTemplate[]; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Unauthorized" };

  const { data, error } = await supabase
    .from("saved_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as SavedTemplate[], error: null };
}

export async function deleteSavedTemplate(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_templates").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
