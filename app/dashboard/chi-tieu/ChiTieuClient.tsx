"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { BudgetPlan, BudgetCategory } from "@/types";

type Props = { cardId: string | null };

const vnd = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

type EditingCategory = Omit<BudgetCategory, "created_at"> & { isNew?: boolean };

export default function ChiTieuClient({ cardId }: Props) {
  const supabase = createClient();

  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanBudget, setNewPlanBudget] = useState("");
  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanBudget, setEditPlanBudget] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<EditingCategory | null>(null);
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    void fetchPlans();
  }, [cardId]);

  useEffect(() => {
    if (!selectedPlanId) return;
    void fetchCategories(selectedPlanId);
  }, [selectedPlanId]);

  const fetchPlans = async () => {
    if (!cardId) return;
    const { data, error } = await supabase
      .from("budget_plans")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at");
    if (error) { toast.error(error.message); return; }
    setPlans(data ?? []);
    if (data && data.length > 0 && !selectedPlanId) {
      setSelectedPlanId(data[0].id);
    }
  };

  const fetchCategories = async (planId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("plan_id", planId)
      .order("created_at");
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setCategories(data ?? []);
  };

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  const stats = useMemo(() => {
    const estimated = categories.reduce((s, c) => s + (c.estimated ?? 0), 0);
    const actual = categories.reduce((s, c) => s + (c.actual ?? 0), 0);
    const totalBudget = selectedPlan?.total_budget ?? 0;
    const remaining = totalBudget - actual;
    const pct = totalBudget > 0 ? Math.min(100, Math.round((actual / totalBudget) * 100)) : 0;
    return { estimated, actual, totalBudget, remaining, pct };
  }, [categories, selectedPlan]);

  const createPlan = async () => {
    if (!cardId || !newPlanName.trim()) { toast.error("Nhập tên ngân sách"); return; }
    setCreatingPlan(true);
    const { data, error } = await supabase
      .from("budget_plans")
      .insert({
        card_id: cardId,
        name: newPlanName.trim(),
        total_budget: Number(newPlanBudget) || 0,
        note: null,
      })
      .select("*")
      .single();
    setCreatingPlan(false);
    if (error) { toast.error(error.message); return; }
    setPlans((prev) => [...prev, data as BudgetPlan]);
    setSelectedPlanId((data as BudgetPlan).id);
    setCategories([]);
    setNewPlanName("");
    setNewPlanBudget("");
    setShowNewPlanModal(false);
    toast.success("Đã tạo ngân sách");
  };

  const openEditPlan = () => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;
    setEditPlanName(plan.name);
    setEditPlanBudget(String(plan.total_budget ?? 0));
    setShowEditPlanModal(true);
  };

  const updatePlan = async () => {
    if (!selectedPlanId || !editPlanName.trim()) {
      toast.error("Nhập tên ngân sách");
      return;
    }
    setSavingPlan(true);
    const { data, error } = await supabase
      .from("budget_plans")
      .update({
        name: editPlanName.trim(),
        total_budget: Number(editPlanBudget) || 0,
      })
      .eq("id", selectedPlanId)
      .select("*")
      .single();
    setSavingPlan(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPlans((prev) => prev.map((p) => (p.id === selectedPlanId ? (data as BudgetPlan) : p)));
    setShowEditPlanModal(false);
    toast.success("Đã cập nhật ngân sách");
  };

  const deletePlan = async (planId: string) => {
    if (!confirm("Xóa ngân sách này và tất cả danh mục?")) return;
    const { error } = await supabase.from("budget_plans").delete().eq("id", planId);
    if (error) { toast.error(error.message); return; }
    const next = plans.filter((p) => p.id !== planId);
    setPlans(next);
    if (selectedPlanId === planId) {
      setSelectedPlanId(next[0]?.id ?? null);
      setCategories([]);
    }
    toast.success("Đã xóa");
  };

  const openAddCat = () => {
    setEditingCat({
      id: "",
      plan_id: selectedPlanId ?? "",
      name: "",
      description: "",
      estimated: 0,
      actual: 0,
      isNew: true,
    });
    setShowAddCatModal(true);
  };

  const openEditCat = (cat: BudgetCategory) => {
    setEditingCat({ ...cat, isNew: false });
    setShowAddCatModal(true);
  };

  const saveCat = async () => {
    if (!editingCat || !selectedPlanId) return;
    if (!editingCat.name.trim()) { toast.error("Nhập tên danh mục"); return; }
    setSavingCat(true);
    if (editingCat.isNew) {
      const { data, error } = await supabase
        .from("budget_categories")
        .insert({
          plan_id: selectedPlanId,
          name: editingCat.name.trim(),
          description: editingCat.description || null,
          estimated: Number(editingCat.estimated) || 0,
          actual: Number(editingCat.actual) || 0,
        })
        .select("*")
        .single();
      setSavingCat(false);
      if (error) { toast.error(error.message); return; }
      setCategories((prev) => [...prev, data as BudgetCategory]);
    } else {
      const { data, error } = await supabase
        .from("budget_categories")
        .update({
          name: editingCat.name.trim(),
          description: editingCat.description || null,
          estimated: Number(editingCat.estimated) || 0,
          actual: Number(editingCat.actual) || 0,
        })
        .eq("id", editingCat.id)
        .select("*")
        .single();
      setSavingCat(false);
      if (error) { toast.error(error.message); return; }
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCat.id ? (data as BudgetCategory) : c))
      );
    }
    toast.success("Đã lưu danh mục");
    setShowAddCatModal(false);
    setEditingCat(null);
  };

  const deleteCat = async (catId: string) => {
    if (!confirm("Xóa danh mục này?")) return;
    const { error } = await supabase.from("budget_categories").delete().eq("id", catId);
    if (error) { toast.error(error.message); return; }
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    toast.success("Đã xóa");
  };

  const exportCsv = () => {
    const planName = selectedPlan?.name ?? "ngan-sach";
    const header = "Danh mục,Mô tả,Dự kiến (VND),Thực tế (VND),Chênh lệch\n";
    const lines = categories.map((c) =>
      [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${(c.description ?? "").replace(/"/g, '""')}"`,
        c.estimated,
        c.actual,
        c.actual - c.estimated,
      ].join(",")
    );
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${planName.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Đã xuất CSV");
  };

  if (!cardId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Quản lý chi tiêu</h1>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
          Bạn chưa có thiệp cưới. Vui lòng tạo thiệp cưới trước.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý chi tiêu</h1>
          <p className="text-sm text-neutral-500">Lên kế hoạch ngân sách và theo dõi từng khoản chi giúp bạn không bị vượt quá ngân sách dự kiến.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plans.length > 1 && (
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={selectedPlanId ?? ""}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setShowNewPlanModal(true)}
            className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            + Tạo ngân sách
          </button>
          {selectedPlanId && (
            <>
              <button
                type="button"
                onClick={openEditPlan}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Sửa ngân sách
              </button>
              <button
                type="button"
                onClick={() => void deletePlan(selectedPlanId)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Xóa ngân sách
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Xuất CSV
              </button>
            </>
          )}
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-rose-200 py-16 text-center">
          <p className="text-4xl">💰</p>
          <p className="text-neutral-500">Chưa có ngân sách nào. Tạo ngân sách đầu tiên!</p>
          <button
            type="button"
            onClick={() => setShowNewPlanModal(true)}
            className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Tạo ngân sách
          </button>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          {selectedPlan && (
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <BudgetStatCard
                  label="Tổng ngân sách"
                  value={vnd(stats.totalBudget)}
                  color="text-neutral-700"
                  bg="bg-neutral-50"
                />
                <BudgetStatCard
                  label="Chi phí dự kiến"
                  value={vnd(stats.estimated)}
                  color="text-blue-600"
                  bg="bg-blue-50"
                />
                <BudgetStatCard
                  label="Đã thanh toán"
                  value={vnd(stats.actual)}
                  color="text-green-600"
                  bg="bg-green-50"
                />
                <BudgetStatCard
                  label="Còn lại"
                  value={vnd(stats.remaining)}
                  color={stats.remaining < 0 ? "text-red-600" : "text-rose-600"}
                  bg={stats.remaining < 0 ? "bg-red-50" : "bg-rose-50"}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all ${stats.pct > 90 ? "bg-red-400" : "bg-rose-400"}`}
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-rose-600">{stats.pct}% đã chi</span>
              </div>
            </div>
          )}

          {/* Categories table */}
          {loading ? (
            <div className="py-12 text-center text-neutral-400">Đang tải...</div>
          ) : (
            <div className="rounded-xl border border-neutral-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-medium">Danh mục chi tiêu</span>
                <button
                  type="button"
                  onClick={openAddCat}
                  className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-600"
                >
                  + Thêm danh mục
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-3xl">📊</p>
                  <p className="text-neutral-400">Chưa có danh mục nào</p>
                  <button
                    type="button"
                    onClick={openAddCat}
                    className="rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    + Thêm danh mục đầu tiên
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
                      <tr>
                        <th className="p-3">Danh mục</th>
                        <th className="p-3">Mô tả</th>
                        <th className="p-3 text-right">Dự kiến</th>
                        <th className="p-3 text-right">Thực tế</th>
                        <th className="p-3 text-right">Chênh lệch</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => {
                        const diff = cat.actual - cat.estimated;
                        return (
                          <tr key={cat.id} className="border-b last:border-0 hover:bg-neutral-50">
                            <td className="p-3 font-medium">{cat.name}</td>
                            <td className="p-3 text-neutral-500">{cat.description || "—"}</td>
                            <td className="p-3 text-right tabular-nums">{vnd(cat.estimated)}</td>
                            <td className="p-3 text-right tabular-nums">{vnd(cat.actual)}</td>
                            <td
                              className={`p-3 text-right tabular-nums font-medium ${
                                diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "text-neutral-400"
                              }`}
                            >
                              {diff > 0 ? "+" : ""}
                              {vnd(diff)}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditCat(cat)}
                                  className="text-xs text-rose-600 hover:underline"
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteCat(cat.id)}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t bg-neutral-50 font-semibold">
                      <tr>
                        <td className="p-3" colSpan={2}>Tổng cộng</td>
                        <td className="p-3 text-right tabular-nums">{vnd(stats.estimated)}</td>
                        <td className="p-3 text-right tabular-nums">{vnd(stats.actual)}</td>
                        <td
                          className={`p-3 text-right tabular-nums ${
                            stats.actual - stats.estimated > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {stats.actual - stats.estimated > 0 ? "+" : ""}
                          {vnd(stats.actual - stats.estimated)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Tạo ngân sách mới</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tên ngân sách</label>
                <input
                  autoFocus
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                  placeholder="vd: Ngân sách cưới 2026"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tổng ngân sách (VND)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                  placeholder="vd: 200000000"
                  value={newPlanBudget}
                  onChange={(e) => setNewPlanBudget(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm"
                onClick={() => setShowNewPlanModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={creatingPlan}
                onClick={() => void createPlan()}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {creatingPlan ? "Đang tạo..." : "Tạo ngân sách"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditPlanModal && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowEditPlanModal(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="mb-4 text-lg font-semibold">Sửa ngân sách</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tên ngân sách</label>
                <input
                  autoFocus
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tổng ngân sách (VND)</label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                  value={editPlanBudget}
                  onChange={(e) => setEditPlanBudget(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm"
                onClick={() => setShowEditPlanModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingPlan}
                onClick={() => void updatePlan()}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {savingPlan ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showAddCatModal && editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editingCat.isNew ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tên danh mục</label>
                <input
                  autoFocus
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                  placeholder="vd: Thuê địa điểm"
                  value={editingCat.name}
                  onChange={(e) => setEditingCat((c) => c ? { ...c, name: e.target.value } : c)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Mô tả (tuỳ chọn)</label>
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                  placeholder="Ghi chú thêm..."
                  value={editingCat.description ?? ""}
                  onChange={(e) => setEditingCat((c) => c ? { ...c, description: e.target.value } : c)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Dự kiến (VND)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                    value={editingCat.estimated}
                    onChange={(e) => setEditingCat((c) => c ? { ...c, estimated: Number(e.target.value) } : c)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Thực tế (VND)</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-rose-300 focus:outline-none"
                    value={editingCat.actual}
                    onChange={(e) => setEditingCat((c) => c ? { ...c, actual: Number(e.target.value) } : c)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm"
                onClick={() => { setShowAddCatModal(false); setEditingCat(null); }}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingCat}
                onClick={() => void saveCat()}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {savingCat ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetStatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-lg p-3 ${bg}`}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-0.5 text-base font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
