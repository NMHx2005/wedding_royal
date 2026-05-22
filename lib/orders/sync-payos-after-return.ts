import type { SupabaseClient } from "@supabase/supabase-js";
import { getPayOS } from "@/lib/payos";
import { payosAmountMatchesOrder } from "@/lib/orders/verify-payos-amount";
import { fulfillPaidOrder } from "./fulfill-order";

/** After user returns from PayOS checkout, confirm status via API and fulfill if PAID. */
export async function syncPayosOrderIfPaid(
  supabaseAdmin: SupabaseClient,
  orderId: string
): Promise<{ ok: boolean; fulfilled: boolean; error?: string }> {
  const { data: order, error: findErr } = await supabaseAdmin
    .from("orders")
    .select("id, status, payos_order_id, amount")
    .eq("id", orderId)
    .maybeSingle();

  if (findErr || !order) {
    return { ok: false, fulfilled: false, error: findErr?.message ?? "Order not found" };
  }

  if (order.status === "paid") {
    return { ok: true, fulfilled: true };
  }

  if (order.status !== "pending" || !order.payos_order_id) {
    return { ok: true, fulfilled: false };
  }

  const orderCode = Number(order.payos_order_id);
  if (!Number.isFinite(orderCode) || orderCode <= 0) {
    return { ok: false, fulfilled: false, error: "Invalid PayOS order code" };
  }

  try {
    const payos = getPayOS();
    const link = await payos.paymentRequests.get(orderCode);
    if (link.status === "PAID") {
      const paidAmount = Number(link.amount);
      if (!payosAmountMatchesOrder(Number(order.amount), paidAmount)) {
        return { ok: false, fulfilled: false, error: "Số tiền PayOS không khớp đơn hàng" };
      }
      const result = await fulfillPaidOrder(
        supabaseAdmin,
        order.id,
        order.payos_order_id,
        paidAmount
      );
      if (!result.ok) {
        return { ok: false, fulfilled: false, error: result.error };
      }
      return { ok: true, fulfilled: true };
    }
    return { ok: true, fulfilled: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PayOS error";
    return { ok: false, fulfilled: false, error: msg };
  }
}
