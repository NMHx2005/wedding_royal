import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { normalizeFeatureKey } from "@/lib/features/normalize-feature-key";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    key?: string;
    name?: string;
    description?: string;
    price?: number;
    sort_order?: number;
    is_active?: boolean;
    thumbnail_url?: string | null;
  };

  const key = normalizeFeatureKey(body.key ?? "");
  if (!key) {
    return NextResponse.json(
      { error: "Key không hợp lệ (chỉ dùng chữ, số, gạch dưới, ví dụ: my_feature)" },
      { status: 400 }
    );
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Cần nhập tên tính năng" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  const { data: existing } = await admin
    .from("feature_catalog")
    .select("key, name")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: `Key "${key}" đã tồn tại (${existing.name}). Hãy sửa tính năng cũ hoặc dùng key khác.`,
        existingKey: key,
      },
      { status: 409 }
    );
  }

  const row = {
    key,
    name: body.name.trim(),
    description: body.description?.trim() ?? "",
    price: Math.max(0, Number(body.price) || 0),
    sort_order: Number(body.sort_order) || 0,
    is_active: body.is_active !== false,
    thumbnail_url: body.thumbnail_url ?? null,
  };

  const { data, error } = await admin.from("feature_catalog").insert(row).select().single();
  if (error) {
    const isDuplicate =
      error.code === "23505" || error.message.includes("feature_catalog_pkey");
    return NextResponse.json(
      {
        error: isDuplicate
          ? `Key "${key}" đã có trong catalog. Không thể tạo trùng.`
          : error.message,
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { key?: string; [k: string]: unknown };
  if (!body.key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const { key, ...update } = body;
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("feature_catalog")
    .update(update)
    .eq("key", key)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });

  const admin = createServiceRoleClient();

  const { count: entitlementCount } = await admin
    .from("wedding_card_feature_entitlements")
    .select("*", { count: "exact", head: true })
    .eq("feature_key", key);

  if (entitlementCount && entitlementCount > 0) {
    return NextResponse.json(
      {
        error: `Không thể xóa: ${entitlementCount} thiệp đã mua tính năng này. Hãy tắt "Active" thay vì xóa.`,
      },
      { status: 409 }
    );
  }

  const { error } = await admin.from("feature_catalog").delete().eq("key", key);
  if (error) {
    const blocked =
      error.code === "23503" || error.message.includes("foreign key");
    return NextResponse.json(
      {
        error: blocked
          ? "Không thể xóa vì còn dữ liệu liên quan (đơn hàng / quyền đã cấp). Hãy tắt Active."
          : error.message,
      },
      { status: blocked ? 409 : 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
