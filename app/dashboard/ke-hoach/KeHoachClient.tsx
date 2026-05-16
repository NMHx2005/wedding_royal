"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { WeddingPlan, PlanTaskGroup, PlanTask, TaskStatus } from "@/types";

type GroupWithTasks = PlanTaskGroup & { tasks: PlanTask[] };

type Props = { cardId: string | null };

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  pending: "in_progress",
  in_progress: "done",
  done: "pending",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Chưa bắt đầu",
  in_progress: "Đang làm",
  done: "Hoàn thành",
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
};

export default function KeHoachClient({ cardId }: Props) {
  const supabase = createClient();

  const [plans, setPlans] = useState<WeddingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupWithTasks[]>([]);
  const [loading, setLoading] = useState(false);

  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanBudget, setNewPlanBudget] = useState("");
  const [creatingPlan, setCreatingPlan] = useState(false);

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [addingTaskGroupId, setAddingTaskGroupId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanBudget, setEditPlanBudget] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");

  useEffect(() => {
    if (!cardId) return;
    void fetchPlans();
  }, [cardId]);

  useEffect(() => {
    if (!selectedPlanId) return;
    void fetchGroups(selectedPlanId);
  }, [selectedPlanId]);

  const fetchPlans = async () => {
    if (!cardId) return;
    const { data, error } = await supabase
      .from("wedding_plans")
      .select("*")
      .eq("card_id", cardId)
      .order("created_at");
    if (error) { toast.error(error.message); return; }
    setPlans(data ?? []);
    if (data && data.length > 0 && !selectedPlanId) {
      setSelectedPlanId(data[0].id);
    }
  };

  const fetchGroups = async (planId: string) => {
    setLoading(true);
    const { data: groupData, error: gErr } = await supabase
      .from("plan_task_groups")
      .select("*")
      .eq("plan_id", planId)
      .order("sort_order");
    if (gErr) { toast.error(gErr.message); setLoading(false); return; }

    const groupIds = (groupData ?? []).map((g) => g.id);
    const { data: taskData, error: tErr } = groupIds.length
      ? await supabase
          .from("plan_tasks")
          .select("*")
          .in("group_id", groupIds)
          .order("sort_order")
      : { data: [], error: null };
    if (tErr) { toast.error(tErr.message); setLoading(false); return; }

    const tasksByGroup: Record<string, PlanTask[]> = {};
    for (const t of taskData ?? []) {
      if (!tasksByGroup[t.group_id]) tasksByGroup[t.group_id] = [];
      tasksByGroup[t.group_id].push(t as PlanTask);
    }

    setGroups(
      (groupData ?? []).map((g) => ({ ...g, tasks: tasksByGroup[g.id] ?? [] } as GroupWithTasks))
    );
    setLoading(false);
  };

  const allTasks = useMemo(() => groups.flatMap((g) => g.tasks), [groups]);
  const stats = useMemo(() => {
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.status === "done").length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const pending = allTasks.filter((t) => t.status === "pending").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pending, pct };
  }, [allTasks]);

  const createPlan = async () => {
    if (!cardId || !newPlanName.trim()) { toast.error("Nhập tên kế hoạch"); return; }
    setCreatingPlan(true);
    const { data, error } = await supabase
      .from("wedding_plans")
      .insert({
        card_id: cardId,
        name: newPlanName.trim(),
        budget: Number(newPlanBudget) || 0,
        note: null,
      })
      .select("*")
      .single();
    setCreatingPlan(false);
    if (error) { toast.error(error.message); return; }
    setPlans((prev) => [...prev, data as WeddingPlan]);
    setSelectedPlanId((data as WeddingPlan).id);
    setNewPlanName("");
    setNewPlanBudget("");
    setShowNewPlanModal(false);
    toast.success("Đã tạo kế hoạch");
  };

  const openEditPlan = () => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;
    setEditPlanName(plan.name);
    setEditPlanBudget(String(plan.budget ?? 0));
    setShowEditPlanModal(true);
  };

  const updatePlan = async () => {
    if (!selectedPlanId || !editPlanName.trim()) {
      toast.error("Nhập tên kế hoạch");
      return;
    }
    setSavingPlan(true);
    const { data, error } = await supabase
      .from("wedding_plans")
      .update({
        name: editPlanName.trim(),
        budget: Number(editPlanBudget) || 0,
      })
      .eq("id", selectedPlanId)
      .select("*")
      .single();
    setSavingPlan(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPlans((prev) => prev.map((p) => (p.id === selectedPlanId ? (data as WeddingPlan) : p)));
    setShowEditPlanModal(false);
    toast.success("Đã cập nhật kế hoạch");
  };

  const saveGroupName = async (groupId: string) => {
    if (!editGroupName.trim()) {
      toast.error("Nhập tên nhóm");
      return;
    }
    const { error } = await supabase
      .from("plan_task_groups")
      .update({ name: editGroupName.trim() })
      .eq("id", groupId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: editGroupName.trim() } : g))
    );
    setEditingGroupId(null);
    toast.success("Đã đổi tên nhóm");
  };

  const saveTaskTitle = async (taskId: string) => {
    if (!editTaskTitle.trim()) {
      toast.error("Nhập tên nhiệm vụ");
      return;
    }
    const { error } = await supabase
      .from("plan_tasks")
      .update({ title: editTaskTitle.trim() })
      .eq("id", taskId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, title: editTaskTitle.trim() } : t)),
      }))
    );
    setEditingTaskId(null);
    toast.success("Đã cập nhật nhiệm vụ");
  };

  const deletePlan = async (planId: string) => {
    if (!confirm("Xóa kế hoạch này và tất cả nhiệm vụ?")) return;
    const { error } = await supabase.from("wedding_plans").delete().eq("id", planId);
    if (error) { toast.error(error.message); return; }
    const next = plans.filter((p) => p.id !== planId);
    setPlans(next);
    if (selectedPlanId === planId) {
      setSelectedPlanId(next[0]?.id ?? null);
      setGroups([]);
    }
    toast.success("Đã xóa");
  };

  const addGroup = async () => {
    if (!selectedPlanId || !newGroupName.trim()) { toast.error("Nhập tên nhóm"); return; }
    const { data, error } = await supabase
      .from("plan_task_groups")
      .insert({ plan_id: selectedPlanId, name: newGroupName.trim(), sort_order: groups.length })
      .select("*")
      .single();
    if (error) { toast.error(error.message); return; }
    setGroups((prev) => [...prev, { ...(data as PlanTaskGroup), tasks: [] }]);
    setNewGroupName("");
    setShowAddGroupModal(false);
    toast.success("Đã thêm nhóm");
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Xóa nhóm và tất cả nhiệm vụ trong nhóm?")) return;
    const { error } = await supabase.from("plan_task_groups").delete().eq("id", groupId);
    if (error) { toast.error(error.message); return; }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    toast.success("Đã xóa nhóm");
  };

  const addTask = async (groupId: string) => {
    if (!newTaskTitle.trim()) { toast.error("Nhập tên nhiệm vụ"); return; }
    const group = groups.find((g) => g.id === groupId);
    const { data, error } = await supabase
      .from("plan_tasks")
      .insert({
        group_id: groupId,
        title: newTaskTitle.trim(),
        status: "pending" as TaskStatus,
        due_date: newTaskDue || null,
        sort_order: group?.tasks.length ?? 0,
      })
      .select("*")
      .single();
    if (error) { toast.error(error.message); return; }
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, tasks: [...g.tasks, data as PlanTask] } : g
      )
    );
    setNewTaskTitle("");
    setNewTaskDue("");
    setAddingTaskGroupId(null);
    toast.success("Đã thêm nhiệm vụ");
  };

  const toggleTaskStatus = async (task: PlanTask) => {
    const nextStatus = STATUS_CYCLE[task.status];
    const { error } = await supabase
      .from("plan_tasks")
      .update({ status: nextStatus })
      .eq("id", task.id);
    if (error) { toast.error(error.message); return; }
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) =>
          t.id === task.id ? { ...t, status: nextStatus } : t
        ),
      }))
    );
  };

  const deleteTask = async (task: PlanTask) => {
    const { error } = await supabase.from("plan_tasks").delete().eq("id", task.id);
    if (error) { toast.error(error.message); return; }
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tasks: g.tasks.filter((t) => t.id !== task.id),
      }))
    );
  };

  if (!cardId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Kế hoạch cưới</h1>
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
          <h1 className="text-2xl font-semibold">Kế hoạch cưới</h1>
          <p className="text-sm text-neutral-500">Giữ cho mọi thứ ngăn nắp giúp bạn tránh được căng thẳng vào phút chót và tận hưởng đám cưới của mình nhiều hơn.</p>
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
            + Tạo kế hoạch
          </button>
          {selectedPlanId && (
            <>
              <button
                type="button"
                onClick={openEditPlan}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Sửa kế hoạch
              </button>
              <button
                type="button"
                onClick={() => void deletePlan(selectedPlanId)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Xóa kế hoạch
              </button>
            </>
          )}
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-rose-200 py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="text-neutral-500">Chưa có kế hoạch nào. Tạo kế hoạch đầu tiên!</p>
          <button
            type="button"
            onClick={() => setShowNewPlanModal(true)}
            className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Tạo kế hoạch
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          {selectedPlanId && (
            <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Tổng nhiệm vụ" value={stats.total} color="text-neutral-700" />
                <StatCard label="Hoàn thành" value={stats.done} color="text-green-600" />
                <StatCard label="Đang làm" value={stats.inProgress} color="text-amber-600" />
                <StatCard label="Chưa bắt đầu" value={stats.pending} color="text-neutral-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-rose-400 transition-all"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-rose-600">{stats.pct}%</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-neutral-400">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const done = group.tasks.filter((t) => t.status === "done").length;
                const total = group.tasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={group.id} className="rounded-xl border border-neutral-100 bg-white shadow-sm">
                    {/* Group header */}
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {editingGroupId === group.id ? (
                            <input
                              autoFocus
                              className="rounded border px-2 py-0.5 text-sm font-semibold"
                              value={editGroupName}
                              onChange={(e) => setEditGroupName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void saveGroupName(group.id);
                                if (e.key === "Escape") setEditingGroupId(null);
                              }}
                              onBlur={() => void saveGroupName(group.id)}
                            />
                          ) : (
                            <button
                              type="button"
                              className="font-semibold hover:text-rose-600"
                              onClick={() => {
                                setEditingGroupId(group.id);
                                setEditGroupName(group.name);
                              }}
                            >
                              {group.name}
                            </button>
                          )}
                          <span className="text-xs text-neutral-400">{done}/{total}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-rose-300 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingTaskGroupId(group.id)}
                          className="rounded-lg border px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          + Thêm nhiệm vụ
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteGroup(group.id)}
                          className="rounded-lg border border-red-100 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50"
                        >
                          Xóa nhóm
                        </button>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="divide-y">
                      {group.tasks.length === 0 && addingTaskGroupId !== group.id && (
                        <p className="px-4 py-3 text-sm text-neutral-400">Chưa có nhiệm vụ nào</p>
                      )}
                      {group.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => void toggleTaskStatus(task)}
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${STATUS_COLOR[task.status]}`}
                            title={STATUS_LABEL[task.status]}
                          >
                            {task.status === "done" ? "✓" : task.status === "in_progress" ? "▶" : "○"}
                          </button>
                          {editingTaskId === task.id ? (
                            <input
                              autoFocus
                              className="flex-1 rounded border px-2 py-0.5 text-sm"
                              value={editTaskTitle}
                              onChange={(e) => setEditTaskTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") void saveTaskTitle(task.id);
                                if (e.key === "Escape") setEditingTaskId(null);
                              }}
                              onBlur={() => void saveTaskTitle(task.id)}
                            />
                          ) : (
                            <button
                              type="button"
                              className={`flex-1 text-left text-sm ${task.status === "done" ? "line-through text-neutral-400" : ""}`}
                              onClick={() => {
                                setEditingTaskId(task.id);
                                setEditTaskTitle(task.title);
                              }}
                            >
                              {task.title}
                            </button>
                          )}
                          {task.due_date && (
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-600">
                              {new Date(task.due_date).toLocaleDateString("vi-VN")}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => void deleteTask(task)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}

                      {/* Inline add task */}
                      {addingTaskGroupId === group.id && (
                        <div className="flex flex-wrap items-center gap-2 bg-rose-50 px-4 py-2.5">
                          <input
                            autoFocus
                            className="flex-1 rounded border border-rose-200 bg-white px-2 py-1.5 text-sm focus:outline-none"
                            placeholder="Tên nhiệm vụ"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") void addTask(group.id); }}
                          />
                          <input
                            type="date"
                            className="rounded border border-rose-200 bg-white px-2 py-1.5 text-sm focus:outline-none"
                            value={newTaskDue}
                            onChange={(e) => setNewTaskDue(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => void addTask(group.id)}
                            className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            Thêm
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAddingTaskGroupId(null); setNewTaskTitle(""); setNewTaskDue(""); }}
                            className="rounded-lg border px-3 py-1.5 text-xs"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add group button */}
              <button
                type="button"
                onClick={() => setShowAddGroupModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-rose-200 py-4 text-sm text-rose-500 hover:border-rose-300 hover:bg-rose-50"
              >
                + Thêm nhóm nhiệm vụ
              </button>
            </div>
          )}
        </>
      )}

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <Modal title="Tạo kế hoạch mới" onClose={() => setShowNewPlanModal(false)}>
          <div className="space-y-3">
            <input
              autoFocus
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Tên kế hoạch (vd: Kế hoạch cưới 2026)"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
            />
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Ngân sách dự kiến (VND)"
              value={newPlanBudget}
              onChange={(e) => setNewPlanBudget(e.target.value)}
            />
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
              {creatingPlan ? "Đang tạo..." : "Tạo kế hoạch"}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Plan Modal */}
      {showEditPlanModal && (
        <Modal title="Sửa kế hoạch" onClose={() => setShowEditPlanModal(false)}>
          <div className="space-y-3">
            <input
              autoFocus
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Tên kế hoạch"
              value={editPlanName}
              onChange={(e) => setEditPlanName(e.target.value)}
            />
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Ngân sách dự kiến (VND)"
              value={editPlanBudget}
              onChange={(e) => setEditPlanBudget(e.target.value)}
            />
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
        </Modal>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <Modal title="Thêm nhóm nhiệm vụ" onClose={() => setShowAddGroupModal(false)}>
          <input
            autoFocus
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Tên nhóm (vd: Chuẩn bị trang phục)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void addGroup(); }}
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm"
              onClick={() => { setShowAddGroupModal(false); setNewGroupName(""); }}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => void addGroup()}
              className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Thêm
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
