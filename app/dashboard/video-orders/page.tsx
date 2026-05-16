import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VideoOrdersClient from "./VideoOrdersClient";

export const metadata = { title: "Đơn hàng video của tôi" };

export default async function VideoOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: card } = await supabase
    .from("wedding_cards")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const [{ data: orders }, { data: catalog }] = await Promise.all([
    supabase
      .from("video_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("video_catalog")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <Suspense fallback={null}>
      <VideoOrdersClient
        cardId={card?.id ?? null}
        userId={user.id}
        initialOrders={orders ?? []}
        catalog={catalog ?? []}
      />
    </Suspense>
  );
}
