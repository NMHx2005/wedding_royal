"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireCardSubscription } from "@/lib/subscription/require-card-subscription";

async function gateWish(supabase: Awaited<ReturnType<typeof createClient>>, wishId: string) {
  const { data: wish } = await supabase.from("wishes").select("card_id").eq("id", wishId).maybeSingle();
  if (!wish?.card_id) return { ok: false as const, error: "Không tìm thấy lời chúc" };
  return requireCardSubscription(supabase, wish.card_id);
}

export async function setWishApproved(wishId: string, isApproved: boolean): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const gate = await gateWish(supabase, wishId);
  if (!gate.ok) return { error: gate.error };
  const { error } = await supabase.from("wishes").update({ is_approved: isApproved }).eq("id", wishId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/loi-chuc");
  return { error: null };
}

export async function deleteWish(wishId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const gate = await gateWish(supabase, wishId);
  if (!gate.ok) return { error: gate.error };
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
  const gate = await requireCardSubscription(supabase, cardId);
  if (!gate.ok) return { error: gate.error };
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
  const { data: log } = await supabase.from("gift_logs").select("card_id").eq("id", logId).maybeSingle();
  if (!log?.card_id) return { error: "Không tìm thấy giao dịch" };
  const gate = await requireCardSubscription(supabase, log.card_id);
  if (!gate.ok) return { error: gate.error };
  const { error } = await supabase.from("gift_logs").delete().eq("id", logId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/mung-cuoi");
  return { error: null };
}
