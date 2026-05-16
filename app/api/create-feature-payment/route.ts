import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { createFeaturePaymentSchema } from "@/lib/validations/api";
import { generatePayOSOrderCode, getPayOS, payosPaymentDescription } from "@/lib/payos";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createFeaturePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId, featureKeys } = parsed.data;

  const { data: card, error: cardErr } = await supabase
    .from("wedding_cards")
    .select("id, user_id")
    .eq("id", cardId)
    .maybeSingle();

  if (cardErr || !card || card.user_id !== user.id) {
    return NextResponse.json({ error: "Không tìm thấy thiệp" }, { status: 404 });
  }

  const { data: catalogRows, error: catalogErr } = await supabase
    .from("feature_catalog")
    .select("key, price")
    .eq("is_active", true)
    .in("key", featureKeys);

  if (catalogErr) {
    return NextResponse.json({ error: catalogErr.message }, { status: 500 });
  }

  const activeKeys = new Set(catalogRows?.map((r) => r.key) ?? []);
  const missing = featureKeys.filter((k) => !activeKeys.has(k));
  if (missing.length > 0) {
    return NextResponse.json({ error: `Tính năng không hợp lệ: ${missing.join(", ")}` }, { status: 400 });
  }

  const totalAmount = (catalogRows ?? []).reduce((sum, row) => {
    const priceNum = typeof row.price === "string" ? Number(row.price) : row.price;
    return sum + (typeof priceNum === "number" && Number.isFinite(priceNum) ? priceNum : 0);
  }, 0);

  if (totalAmount <= 0) {
    return NextResponse.json({ error: "Tổng tiền không hợp lệ" }, { status: 400 });
  }

  const orderCode = generatePayOSOrderCode();
  const payosOrderId = String(orderCode);

  const { data: orderRow, error: orderInsErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      card_id: card.id,
      payos_order_id: payosOrderId,
      plan: "basic",
      amount: totalAmount,
      status: "pending",
      order_type: "features",
      feature_keys: featureKeys,
    })
    .select("id")
    .single();

  if (orderInsErr || !orderRow) {
    return NextResponse.json({ error: orderInsErr?.message ?? "Không tạo được đơn" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const returnUrl = `${appUrl}/dashboard/goi-dich-vu?success=true&source=features&orderId=${orderRow.id}`;
  const cancelUrl = `${appUrl}/dashboard/goi-dich-vu?cancelled=true&source=features`;

  try {
    const payos = getPayOS();
    const featureDesc =
      featureKeys.length > 0 && featureKeys.join(",").length <= 20
        ? `Lẻ ${featureKeys.join(",")}`
        : `Lẻ ${featureKeys.length} mục`;
    const payment = await payos.paymentRequests.create({
      orderCode,
      amount: totalAmount,
      description: payosPaymentDescription(featureDesc),
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

