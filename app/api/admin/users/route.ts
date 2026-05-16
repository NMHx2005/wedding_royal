import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { UserRole, Plan } from "@/types";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createServiceRoleClient();

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    admin
      .from("profiles")
      .select("*, wedding_cards(id, plan, status, slug, bride_name, groom_name)")
      .order("created_at", { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const rows = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id] ?? "",
  }));

  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    userId?: string;
    role?: UserRole;
    cardId?: string;
    plan?: Plan;
  };

  const admin = createServiceRoleClient();

  if (body.role !== undefined && body.userId) {
    const { error } = await admin
      .from("profiles")
      .update({ role: body.role })
      .eq("id", body.userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (body.plan !== undefined) {
    if (body.cardId) {
      const { error } = await admin
        .from("wedding_cards")
        .update({ plan: body.plan })
        .eq("id", body.cardId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (body.userId) {
      const { error } = await admin
        .from("wedding_cards")
        .update({ plan: body.plan })
        .eq("user_id", body.userId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
