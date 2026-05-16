"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function insertGuest(
  cardId: string,
  row: { name: string; group_label?: string | null; phone?: string | null; email?: string | null; is_vip?: boolean }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("guests").insert({
    card_id: cardId,
    name: row.name,
    group_label: row.group_label ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    is_vip: row.is_vip ?? false,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/khach-moi");
  return { error: null };
}

export async function deleteGuest(guestId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("guests").delete().eq("id", guestId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/khach-moi");
  return { error: null };
}

export async function insertGuestsBulk(
  cardId: string,
  rows: { name: string; group_label?: string | null; phone?: string | null; email?: string | null }[]
): Promise<{ error: string | null; inserted: number }> {
  const supabase = await createClient();
  const payload = rows.map((r) => ({
    card_id: cardId,
    name: r.name,
    group_label: r.group_label ?? null,
    phone: r.phone ?? null,
    email: r.email ?? null,
  }));
  const { error, data } = await supabase.from("guests").insert(payload).select("id");
  if (error) return { error: error.message, inserted: 0 };
  revalidatePath("/dashboard/khach-moi");
  return { error: null, inserted: data?.length ?? 0 };
}
