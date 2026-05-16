import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { generatePayOSOrderCode, getPayOS, payosPaymentDescription } from "@/lib/payos";

const schema = z.object({
  videoOrderId: z.string().uuid(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: videoOrder, error: voErr } = await supabase
    .from("video_orders")
    .select("id, user_id, card_id, title, price, status")
    .eq("id", parsed.data.videoOrderId)
    .maybeSingle();

  if (voErr || !videoOrder || videoOrder.user_id !== user.id) {
    return NextResponse.json({ error: "Không tìm thấy đơn video" }, { status: 404 });
  }

  if (videoOrder.status !== "created" && videoOrder.status !== "pending_payment") {
    return NextResponse.json({ error: "Đơn không thể thanh toán" }, { status: 400 });
  }

  const amount = Number(videoOrder.price) || 0;
  if (amount <= 0) {
    return NextResponse.json({ error: "Giá không hợp lệ" }, { status: 400 });
  }

  const orderCode = generatePayOSOrderCode();
  const payosOrderId = String(orderCode);

  const { data: orderRow, error: orderInsErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      card_id: videoOrder.card_id,
      payos_order_id: payosOrderId,
      plan: "basic",
      amount,
      status: "pending",
      order_type: "video",
      video_order_id: videoOrder.id,
    })
    .select("id")
    .single();

  if (orderInsErr || !orderRow) {
    return NextResponse.json({ error: orderInsErr?.message ?? "Không tạo được đơn" }, { status: 500 });
  }

  await supabase
    .from("video_orders")
    .update({ status: "pending_payment" })
    .eq("id", videoOrder.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnUrl = `${appUrl}/dashboard/video-orders?success=true&orderId=${orderRow.id}`;
  const cancelUrl = `${appUrl}/dashboard/video-orders?cancelled=true`;

  try {
    const payos = getPayOS();
    const payment = await payos.paymentRequests.create({
      orderCode,
      amount,
      description: payosPaymentDescription(
        videoOrder.title?.trim() ? `Video: ${videoOrder.title}` : "Video package"
      ),
      returnUrl,
      cancelUrl,
    });

    return NextResponse.json({ checkoutUrl: payment.checkoutUrl, orderId: orderRow.id });
  } catch (e) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderRow.id);
    const message = e instanceof Error ? e.message : "PayOS error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
