import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET() {
  const supabase = await createRouteHandlerClient();

  const { data, error } = await supabase
    .from("feature_catalog")
    .select("key, name, description, price, thumbnail_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const features = (data ?? []).map((f: { price: unknown }) => ({
    ...f,
    price: typeof f.price === "string" ? Number(f.price) : f.price,
  }));

  return NextResponse.json({ features });
}

