import { NextResponse } from "next/server";
import { createPublicSupabase } from "@/lib/supabase/public";
import { rsvpSchema } from "@/lib/validations/api";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = rsvpSchema.safeParse(body);
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

  if (parsed.data.guestId) {
    const { data: guest, error: gErr } = await supabase
      .from("guests")
      .select("id, card_id")
      .eq("id", parsed.data.guestId)
      .maybeSingle();
    if (gErr || !guest || guest.card_id !== parsed.data.cardId) {
      return NextResponse.json({ error: "Khách mời không hợp lệ" }, { status: 400 });
    }
  }

  const guestCount = parsed.data.guestCount ?? 1;

  const { error } = await supabase.from("rsvp").insert({
    card_id: parsed.data.cardId,
    guest_id: parsed.data.guestId ?? null,
    guest_name: parsed.data.guestName,
    attending: parsed.data.attending,
    guest_count: guestCount,
    note: parsed.data.note ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Đã xác nhận tham dự" });
}
