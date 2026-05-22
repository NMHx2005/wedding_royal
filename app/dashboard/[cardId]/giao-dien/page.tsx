import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PlanGate } from "@/components/ui/PlanGate";
import type { Plan, TemplateRow } from "@/types";

export const metadata = { title: "Giao diện thiệp" };

export default async function GiaoDienPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = await createClient();

  const [{ data: card }, { data: templates }] = await Promise.all([
    supabase.from("wedding_cards").select("id, plan").eq("id", cardId).maybeSingle(),
    supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!card) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Giao diện</h1>
      <p className="text-sm text-neutral-600">Chọn mẫu và áp dụng cho thiệp cưới.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(templates ?? []).map((raw) => {
          const t = raw as TemplateRow;
          const needGate = t.plan_required !== "basic";
          const gatePlan: "vip" | "pro" = t.plan_required === "vip" ? "vip" : "pro";
          const inner = (
            <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-mewedding-rose">{t.plan_required}</p>
              <h2 className="mt-2 font-serif text-xl">{t.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">{t.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {(t.style_tags ?? []).map((tag) => (
                  <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/dashboard/${cardId}/thiet-lap?template=${encodeURIComponent(t.id)}`}
                className="mt-4 inline-block rounded-lg bg-mewedding-rose px-3 py-2 text-sm text-white"
              >
                Dùng mẫu này
              </Link>
            </div>
          );
          return (
            <div key={t.id}>
              {needGate ? (
                <PlanGate requiredPlan={gatePlan} currentPlan={card.plan as Plan}>
                  {inner}
                </PlanGate>
              ) : (
                inner
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
