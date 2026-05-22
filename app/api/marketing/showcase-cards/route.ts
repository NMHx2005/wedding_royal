import { NextResponse } from "next/server";
import { getPublicShowcaseCards } from "@/lib/marketing/get-public-showcase-cards";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 60));
  const items = await getPublicShowcaseCards(limit);
  return NextResponse.json({ items });
}
