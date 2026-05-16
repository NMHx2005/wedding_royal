import { NextResponse } from "next/server";
import { createPublicSupabase } from "@/lib/supabase/public";
import { giftSchema } from "@/lib/validations/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = giftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const supabase = createPublicSupabase();
  const { data: card, error: cardErr } = await supabase
    .from("wedding_cards")
    .select("id, status")
    .eq("id", parsed.data.cardId)
    .maybeSingle();

  if (cardErr || !card || card.status !== "active") {
    return NextResponse.json({ error: "Thiệp không khả dụng" }, { status: 400 });
  }

  const { error } = await supabase.from("gift_logs").insert({
    card_id: parsed.data.cardId,
    guest_name: parsed.data.guestName ?? null,
    amount: parsed.data.amount ?? null,
    note: parsed.data.note ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
