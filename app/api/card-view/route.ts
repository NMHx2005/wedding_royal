import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({ slug: z.string().min(1).max(120) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data: card, error: findErr } = await supabase
      .from("wedding_cards")
      .select("id, view_count, status")
      .eq("slug", parsed.data.slug)
      .maybeSingle();

    if (findErr || !card || card.status !== "active") {
      return NextResponse.json({ ok: true });
    }

    await supabase
      .from("wedding_cards")
      .update({ view_count: (card.view_count ?? 0) + 1 })
      .eq("id", card.id);
  } catch {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
