import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ensureWeddingCard } from "@/app/actions/wedding-card";
import { PlanGate } from "@/components/ui/PlanGate";
import type { TemplateRow } from "@/types";

export default async function GiaoDienPage() {
  const ensured = await ensureWeddingCard();
  if (!ensured.data) return <p className="text-red-600">{ensured.error}</p>;
  const card = ensured.data;
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Giao diện</h1>
      <p className="text-sm text-neutral-600">Chọn mẫu và áp dụng trong Thiết lập thiệp.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(templates ?? []).map((raw) => {
          const t = raw as TemplateRow;
          const needPro = t.plan_required === "pro" || t.plan_required === "vip";
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
                href={`/dashboard/thiet-lap?template=${encodeURIComponent(t.id)}`}
                className="mt-4 inline-block rounded-lg bg-mewedding-rose px-3 py-2 text-sm text-white"
              >
                Dùng mẫu này
              </Link>
            </div>
          );
          return (
            <div key={t.id}>
              {needPro ? (
                <PlanGate requiredPlan="pro" currentPlan={card.plan}>
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
