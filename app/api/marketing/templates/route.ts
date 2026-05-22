import { NextResponse } from "next/server";
import { getMarketingTemplates } from "@/lib/marketing/get-marketing-templates";
import { templateToShowcaseItem } from "@/lib/marketing/template-showcase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 24));
  const format = searchParams.get("format");

  const templates = await getMarketingTemplates();
  const slice = templates.slice(0, limit);

  if (format === "showcase") {
    return NextResponse.json({
      items: slice.map((t, i) => templateToShowcaseItem(t, i)),
    });
  }

  return NextResponse.json({ templates: slice });
}
