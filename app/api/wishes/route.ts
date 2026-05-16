import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicSupabase } from "@/lib/supabase/public";
import { wishSchema } from "@/lib/validations/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");
  if (!cardId) {
    return NextResponse.json({ error: "Thiếu cardId" }, { status: 400 });
  }

  const idParse = z.string().uuid().safeParse(cardId);
  if (!idParse.success) {
    return NextResponse.json({ error: "cardId không hợp lệ" }, { status: 400 });
  }

  const supabase = createPublicSupabase();
  const { data, error } = await supabase
    .from("wishes")
    .select("id, guest_name, message, created_at")
    .eq("card_id", cardId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ wishes: data ?? [] });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = wishSchema.safeParse(body);
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

  const { data: wish, error } = await supabase
    .from("wishes")
    .insert({
      card_id: parsed.data.cardId,
      guest_name: parsed.data.guestName,
      message: parsed.data.message,
      is_approved: true,
    })
    .select("id, guest_name, message, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, wish });
}
