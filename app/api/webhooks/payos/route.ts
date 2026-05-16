import { NextResponse } from "next/server";
import { getPayOS } from "@/lib/payos";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-order";

type PayOSWebhookBody = {
  code: string;
  desc: string;
  success: boolean;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code?: string | null;
    desc?: string | null;
  };
  signature: string;
};

export async function POST(request: Request) {
  let payload: PayOSWebhookBody;
  try {
    payload = (await request.json()) as PayOSWebhookBody;
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  let verified;
  try {
    const payos = getPayOS();
    verified = await payos.webhooks.verify(
      payload as Parameters<(typeof payos)["webhooks"]["verify"]>[0]
    );
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (!verified?.orderCode) {
    return NextResponse.json({ ok: true });
  }

  if (payload.success === false) {
    return NextResponse.json({ ok: true });
  }

  const orderCodeStr = String(verified.orderCode);
  const supabase = createServiceRoleClient();

  const { data: order, error: orderFindErr } = await supabase
    .from("orders")
    .select("id, status")
    .eq("payos_order_id", orderCodeStr)
    .maybeSingle();

  if (orderFindErr || !order || order.status === "paid") {
    return NextResponse.json({ ok: true });
  }

  await fulfillPaidOrder(supabase, order.id, orderCodeStr);

  return NextResponse.json({ ok: true });
}
