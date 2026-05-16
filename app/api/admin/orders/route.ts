import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-order";

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { id?: string; status?: "paid" | "cancelled" };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  if (body.status === "paid") {
    const result = await fulfillPaidOrder(admin, body.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Fulfill failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
