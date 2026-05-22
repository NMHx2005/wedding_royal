/**
 * Seed 3 mẫu Craft khác nhau (Basic / Pro / VIP) + content_json.
 * Run: node --env-file=.env.local scripts/seed-premium-template.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import {
  buildShowcaseTemplateJson,
  thumbnailForVariant,
  VARIANT_DESCRIPTIONS,
} from "../lib/editor/presets/showcase-template-variants.mjs";

const isDirectRun =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

/** Catalog kho giao diện — mỗi gói một thiết kế Craft riêng */
export const SHOWCASE_TEMPLATE_CATALOG = [
  {
    id: "save-the-date-basic",
    plan: "basic",
    variant: "basic",
    previewSlug: "thiep-mau-basic",
    name: "Lời Mời Tối Giản",
    sort_order: 30,
    style_tags: ["Tối giản", "Xanh lá", "Save the Date"],
  },
  {
    id: "save-the-date-pro",
    plan: "pro",
    variant: "pro",
    previewSlug: "thiep-mau-pro",
    name: "Save The Date Cổ Điển",
    sort_order: 40,
    style_tags: ["Cổ điển", "Hồng hồng", "Album ảnh"],
  },
  {
    id: "save-the-date-vip",
    plan: "vip",
    variant: "vip",
    previewSlug: "thiep-mau-vip",
    name: "Royal Gold Luxury",
    sort_order: 50,
    style_tags: ["Luxury", "Vàng đen", "Đầy đủ tính năng"],
  },
];

/** @deprecated — giữ cho script cũ */
export const TEMPLATE_ID = "save-the-date-pro";

export function templateIdForPlan(plan) {
  const row = SHOWCASE_TEMPLATE_CATALOG.find((t) => t.plan === plan);
  return row?.id ?? TEMPLATE_ID;
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 */
export async function upsertShowcaseTemplateCatalog(admin) {
  await admin.from("templates").update({ is_active: false }).eq("id", "premium-save-the-date");

  let totalNodes = 0;
  let animCount = 0;

  for (const t of SHOWCASE_TEMPLATE_CATALOG) {
    const contentJson = buildShowcaseTemplateJson(t.variant);
    const nodes = Object.keys(contentJson).length;
    const anims = Object.values(contentJson).filter((n) => n?.props?.animationEntry).length;
    totalNodes += nodes;
    animCount += anims;

    const row = {
      id: t.id,
      name: t.name,
      description: VARIANT_DESCRIPTIONS[t.variant],
      thumbnail_url: thumbnailForVariant(t.variant),
      preview_url: `/thiep/${t.previewSlug}`,
      plan_required: t.plan,
      style_tags: t.style_tags,
      sort_order: t.sort_order,
      is_active: true,
      content_json: contentJson,
    };

    const { error } = await admin.from("templates").upsert(row, { onConflict: "id" });
    if (error) throw new Error(`Upsert template ${t.id}: ${error.message}`);
    console.log(`  • ${t.name} (${t.variant}): ${nodes} nodes`);
  }

  return {
    nodeCount: totalNodes,
    animCount,
    templateIds: SHOWCASE_TEMPLATE_CATALOG.map((x) => x.id),
  };
}

/** @deprecated */
export async function upsertPremiumTemplate(admin) {
  return upsertShowcaseTemplateCatalog(admin);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env.local");
    process.exit(1);
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Upsert 3 mẫu Craft (thiết kế khác nhau):");
  const { templateIds, animCount } = await upsertShowcaseTemplateCatalog(admin);
  console.log(
    `✓ Xong: ${templateIds.join(", ")} — tổng ${animCount} phần tử có hiệu ứng`
  );
}

if (isDirectRun) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
