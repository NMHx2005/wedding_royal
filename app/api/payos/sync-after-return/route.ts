import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { syncPayosOrderIfPaid } from "@/lib/orders/sync-payos-after-return";

const bodySchema = z.object({
  orderId: z.string().uuid(),
});

/**
 * Called when the user lands on returnUrl after PayOS (webhook may be delayed or unreachable in dev).
 * Verifies payment link status with PayOS API and runs the same fulfillment as the webhook.
 */
export async function POST(req: Request) {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const targetOrderId = parsed.data.orderId;

  const { data: owned } = await supabase
    .from("orders")
    .select("id")
    .eq("id", targetOrderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!owned) {
    return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  }

  const admin = createServiceRoleClient();
  const result = await syncPayosOrderIfPaid(admin, targetOrderId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Lỗi đồng bộ PayOS" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, fulfilled: result.fulfilled });
}
