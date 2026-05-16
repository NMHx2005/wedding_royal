"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setWishApproved(wishId: string, isApproved: boolean): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("wishes").update({ is_approved: isApproved }).eq("id", wishId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/loi-chuc");
  return { error: null };
}

export async function deleteWish(wishId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("wishes").delete().eq("id", wishId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/loi-chuc");
  return { error: null };
}

export async function insertGiftLog(
  cardId: string,
  row: { guest_name?: string | null; amount?: number | null; note?: string | null }
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gift_logs").insert({
    card_id: cardId,
    guest_name: row.guest_name ?? null,
    amount: row.amount ?? null,
    note: row.note ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/mung-cuoi");
  return { error: null };
}

export async function deleteGiftLog(logId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gift_logs").delete().eq("id", logId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/mung-cuoi");
  return { error: null };
}
