"use client";

import { useMemo, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import type { GuestExtended, GuestGroup } from "@/types";

type CardInfo = { id: string; plan: string; slug: string } | null;

type Props = {
  card: CardInfo;
  initialGuests: GuestExtended[];
  initialGroups: GuestGroup[];
};

type GiftFilter = "all" | "cash" | "gold" | "gift" | "none";
type InviteFilter = "all" | "sent" | "not_sent";
type AttendFilter = "all" | "yes" | "no";
type SortKey = "name" | "created_at" | "gift_amount";

const GIFT_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  gold: "Vàng",
  gift: "Quà",
  none: "Không",
};

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

const COLOR_OPTIONS = [
  "#f43f5e",
  "#ec4899",
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#64748b",
];

export default function KhachMoiClient({
  card,
  initialGuests,
  initialGroups,
}: Props) {
  const confirmDialog = useConfirm();
  const supabase = createClient();

  const [guests, setGuests] = useState<GuestExtended[]>(initialGuests);
  const [groups, setGroups] = useState<GuestGroup[]>(initialGroups);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filters & search
  const [search, setSearch] = useState("");
  const [inviteFilter, setInviteFilter] = useState<InviteFilter>("all");
  const [attendFilter, setAttendFilter] = useState<AttendFilter>("all");
  const [giftFilter, setGiftFilter] = useState<GiftFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  // Guest modal
  const [guestModal, setGuestModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestExtended | null>(null);
  const [gName, setGName] = useState("");
  const [gPhone, setGPhone] = useState("");
  const [gEmail, setGEmail] = useState("");
  const [gGroupId, setGGroupId] = useState("");
  const [gNumGuests, setGNumGuests] = useState("1");
  const [gGiftType, setGGiftType] = useState<"cash" | "gold" | "gift" | "">("");
  const [gGiftAmount, setGGiftAmount] = useState("");
  const [gModalLoading, setGModalLoading] = useState(false);
  const [gModalError, setGModalError] = useState("");

  // Group modal
  const [groupModal, setGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(COLOR_OPTIONS[0]);
  const [groupLoading, setGroupLoading] = useState(false);

  const csvInputRef = useRef<HTMLInputElement>(null);

  // ── Derived stats (must be before any early return for hooks rules) ────────
  const totalGuests = guests.length;
  const sentCount = guests.filter((g) => g.invite_sent).length;
  const confirmedCount = guests.filter((g) => g.attending === true).length;
  const noResponseCount = guests.filter((g) => g.attending === null).length;
  const cashSum = guests
    .filter((g) => g.gift_type === "cash")
    .reduce((s, g) => s + (g.gift_amount ?? 0), 0);
  const goldCount = guests.filter((g) => g.gift_type === "gold").length;
  const giftCount = guests.filter((g) => g.gift_type === "gift").length;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = guests;
    if (activeGroupId) result = result.filter((g) => g.group_id === activeGroupId);
    if (search) result = result.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
    if (inviteFilter === "sent") result = result.filter((g) => g.invite_sent);
    if (inviteFilter === "not_sent") result = result.filter((g) => !g.invite_sent);
    if (attendFilter === "yes") result = result.filter((g) => g.attending === true);
    if (attendFilter === "no") result = result.filter((g) => g.attending === false);
    if (giftFilter === "cash") result = result.filter((g) => g.gift_type === "cash");
    if (giftFilter === "gold") result = result.filter((g) => g.gift_type === "gold");
    if (giftFilter === "gift") result = result.filter((g) => g.gift_type === "gift");
    if (giftFilter === "none") result = result.filter((g) => !g.gift_type);
    return [...result].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "gift_amount") return (b.gift_amount ?? 0) - (a.gift_amount ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [guests, activeGroupId, search, inviteFilter, attendFilter, giftFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-lg font-medium text-neutral-600">Bạn chưa có thiệp cưới</p>
        <a
          href="/dashboard/thiet-lap"
          className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          Tạo thiệp ngay
        </a>
      </div>
    );
  }

  // ── Open guest modal ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingGuest(null);
    setGName(""); setGPhone(""); setGEmail(""); setGGroupId("");
    setGNumGuests("1"); setGGiftType(""); setGGiftAmount("");
    setGModalError("");
    setGuestModal(true);
  };

  const openEdit = (g: GuestExtended) => {
    setEditingGuest(g);
    setGName(g.name);
    setGPhone(g.phone ?? "");
    setGEmail(g.email ?? "");
    setGGroupId(g.group_id ?? "");
    setGNumGuests(String(g.num_guests));
    setGGiftType((g.gift_type ?? "") as "cash" | "gold" | "gift" | "");
    setGGiftAmount(g.gift_amount ? String(g.gift_amount) : "");
    setGModalError("");
    setGuestModal(true);
  };

  // ── Save guest ──────────────────────────────────────────────────────────────
  const saveGuest = async () => {
    if (!gName.trim()) { setGModalError("Nhập tên khách"); return; }
    setGModalLoading(true);
    const payload: Partial<GuestExtended> = {
      name: gName.trim(),
      phone: gPhone || null,
      email: gEmail || null,
      group_id: gGroupId || null,
      num_guests: Number(gNumGuests) || 1,
      gift_type: (gGiftType || null) as GuestExtended["gift_type"],
      gift_amount: gGiftAmount ? Number(gGiftAmount) : null,
    };

    if (editingGuest) {
      const { data, error } = await supabase
        .from("guests")
        .update(payload)
        .eq("id", editingGuest.id)
        .select("*")
        .single();
      if (error) { setGModalError(error.message); setGModalLoading(false); return; }
      setGuests((prev) => prev.map((g) => (g.id === editingGuest.id ? (data as GuestExtended) : g)));
    } else {
      const token = Math.random().toString(36).slice(2, 10);
      const { data, error } = await supabase
        .from("guests")
        .insert({ ...payload, card_id: card.id, token, is_vip: false })
        .select("*")
        .single();
      if (error) { setGModalError(error.message); setGModalLoading(false); return; }
      setGuests((prev) => [...prev, data as GuestExtended]);
    }
    setGModalLoading(false);
    setGuestModal(false);
  };

  // ── Delete guest ────────────────────────────────────────────────────────────
  const deleteGuest = async (id: string) => {
    const ok = await confirmDialog({
      title: "Xóa khách",
      message: "Bạn có chắc muốn xóa khách này?",
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (!ok) return;
    await supabase.from("guests").delete().eq("id", id);
    setGuests((prev) => prev.filter((g) => g.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  // ── Send invite (mailto) ────────────────────────────────────────────────────
  const sendInvite = async (g: GuestExtended) => {
    if (g.email) {
      const subject = encodeURIComponent("Thiệp mời đám cưới");
      const body = encodeURIComponent(
        `Kính gửi ${g.name},\n\nChúng tôi trân trọng kính mời bạn tham dự đám cưới của chúng tôi.\n\nhttps://${typeof window !== "undefined" ? window.location.host : ""}/thiep/${card.slug}/${g.token}\n\nTrân trọng!`
      );
      window.open(`mailto:${g.email}?subject=${subject}&body=${body}`);
    }
    await supabase.from("guests").update({ invite_sent: true }).eq("id", g.id);
    setGuests((prev) =>
      prev.map((x) => (x.id === g.id ? { ...x, invite_sent: true } : x))
    );
  };

  // ── Bulk actions ────────────────────────────────────────────────────────────
  const bulkDelete = async () => {
    const ok = await confirmDialog({
      title: "Xóa khách đã chọn",
      message: `Xóa ${selected.size} khách đã chọn? Thao tác không thể hoàn tác.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (!ok) return;
    const ids = Array.from(selected);
    await supabase.from("guests").delete().in("id", ids);
    setGuests((prev) => prev.filter((g) => !ids.includes(g.id)));
    setSelected(new Set());
  };

  const bulkMarkSent = async () => {
    const ids = Array.from(selected);
    await supabase.from("guests").update({ invite_sent: true }).in("id", ids);
    setGuests((prev) =>
      prev.map((g) => (ids.includes(g.id) ? { ...g, invite_sent: true } : g))
    );
    setSelected(new Set());
  };

  // ── Import CSV ──────────────────────────────────────────────────────────────
  const importCsv = async (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return;
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(",");
      return {
        name: (cells[0] ?? "").replace(/^"|"$/g, "").replace(/""/g, '"'),
        phone: cells[1]?.trim() || null,
        email: cells[2]?.trim() || null,
        group_label: cells[3]?.trim() || null,
      };
    }).filter((r) => r.name.length > 0);

    const inserts = rows.map((r) => ({
      card_id: card.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      group_label: r.group_label,
      token: Math.random().toString(36).slice(2, 10),
      is_vip: false,
      num_guests: 1,
      invite_sent: false,
      attending: null,
    }));
    const { data } = await supabase.from("guests").insert(inserts).select("*");
    if (data) setGuests((prev) => [...prev, ...(data as GuestExtended[])]);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const exportCsv = () => {
    const header = "Tên,Điện thoại,Email,Nhóm,Số khách,Lời mời,Tham dự,Quà,Số tiền\n";
    const lines = guests.map((g) => {
      const grp = groups.find((x) => x.id === g.group_id);
      return [
        `"${g.name.replace(/"/g, '""')}"`,
        g.phone ?? "",
        g.email ?? "",
        grp?.name ?? g.group_label ?? "",
        String(g.num_guests),
        g.invite_sent ? "Đã gửi" : "Chưa gửi",
        g.attending === true ? "Tham dự" : g.attending === false ? "Vắng" : "Chưa phản hồi",
        g.gift_type ? GIFT_LABELS[g.gift_type] : "",
        g.gift_amount ? String(g.gift_amount) : "",
      ].join(",");
    });
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "khach-moi.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── Create group ─────────────────────────────────────────────────────────────
  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    setGroupLoading(true);
    const { data } = await supabase
      .from("guest_groups")
      .insert({ card_id: card.id, name: newGroupName.trim(), color: newGroupColor })
      .select("*")
      .single();
    setGroupLoading(false);
    if (data) setGroups((prev) => [...prev, data as GuestGroup]);
    setGroupModal(false);
    setNewGroupName("");
  };

  const deleteGroup = async (id: string) => {
    const ok = await confirmDialog({
      title: "Xóa nhóm",
      message: "Bạn có chắc muốn xóa nhóm khách này?",
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (!ok) return;
    await supabase.from("guest_groups").delete().eq("id", id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (activeGroupId === id) setActiveGroupId(null);
  };

  const allSelected = paginated.length > 0 && paginated.every((g) => selected.has(g.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const n = new Set(prev);
        paginated.forEach((g) => n.delete(g.id));
        return n;
      });
    } else {
      setSelected((prev) => {
        const n = new Set(prev);
        paginated.forEach((g) => n.add(g.id));
        return n;
      });
    }
  };

  return (
    <div className="flex min-h-0 gap-6">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Nhóm khách
            </span>
            <button
              type="button"
              onClick={() => setGroupModal(true)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white hover:bg-rose-600"
            >
              +
            </button>
          </div>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setActiveGroupId(null)}
                className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                  !activeGroupId
                    ? "bg-rose-50 font-semibold text-rose-600"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Tất cả ({guests.length})
              </button>
            </li>
            {groups.map((grp) => {
              const count = guests.filter((g) => g.group_id === grp.id).length;
              return (
                <li key={grp.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveGroupId(grp.id)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-left text-sm transition ${
                      activeGroupId === grp.id
                        ? "bg-rose-50 font-semibold text-rose-600"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: grp.color }}
                    />
                    {grp.name} ({count})
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteGroup(grp.id)}
                    className="shrink-0 text-xs text-neutral-400 hover:text-red-500"
                    title="Xóa nhóm"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-800">Quản lý khách mời</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Theo dõi khách mời, gửi thiệp mời qua email, và kiểm soát những gì khách mời thấy khi mở link riêng của họ.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openAdd}
              className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
            >
              + Thêm khách
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Xuất Excel
            </button>
            <label className="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
              Import CSV
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => void importCsv(String(reader.result ?? ""));
                  reader.readAsText(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {/* Mobile group filter */}
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <select
            className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            value={activeGroupId ?? ""}
            onChange={(e) => setActiveGroupId(e.target.value || null)}
          >
            <option value="">Tất cả ({guests.length})</option>
            {groups.map((grp) => {
              const count = guests.filter((g) => g.group_id === grp.id).length;
              return (
                <option key={grp.id} value={grp.id}>
                  {grp.name} ({count})
                </option>
              );
            })}
          </select>
          <button
            type="button"
            onClick={() => setGroupModal(true)}
            className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            + Nhóm
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "Tổng khách", value: String(totalGuests), color: "text-neutral-800" },
            { label: "Đã gửi lời mời", value: String(sentCount), color: "text-blue-600" },
            { label: "Xác nhận tham dự", value: String(confirmedCount), color: "text-green-600" },
            { label: "Chưa phản hồi", value: String(noResponseCount), color: "text-yellow-600" },
            { label: "Tiền mặt", value: formatVND(cashSum), color: "text-rose-600" },
            { label: "Vàng", value: `${goldCount} phần`, color: "text-amber-600" },
            { label: "Quà", value: `${giftCount} món`, color: "text-purple-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-neutral-100 bg-white p-3 shadow-sm"
            >
              <p className="text-xs text-neutral-500">{s.label}</p>
              <p className={`mt-0.5 text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5">
            <span className="text-sm font-medium text-rose-700">
              Đã chọn {selected.size} khách
            </span>
            <button
              type="button"
              onClick={() => void bulkMarkSent()}
              className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
            >
              Đánh dấu đã gửi lời mời
            </button>
            <button
              type="button"
              onClick={() => void bulkDelete()}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="ml-auto text-sm text-neutral-500 hover:text-neutral-700"
            >
              Bỏ chọn
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Tìm theo tên..."
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select
            className="rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none focus:border-rose-400"
            value={inviteFilter}
            onChange={(e) => { setInviteFilter(e.target.value as InviteFilter); setPage(1); }}
          >
            <option value="all">Lời mời: Tất cả</option>
            <option value="sent">Đã gửi</option>
            <option value="not_sent">Chưa gửi</option>
          </select>
          <select
            className="rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none focus:border-rose-400"
            value={attendFilter}
            onChange={(e) => { setAttendFilter(e.target.value as AttendFilter); setPage(1); }}
          >
            <option value="all">Tham dự: Tất cả</option>
            <option value="yes">Xác nhận</option>
            <option value="no">Vắng mặt</option>
          </select>
          <select
            className="rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none focus:border-rose-400"
            value={giftFilter}
            onChange={(e) => { setGiftFilter(e.target.value as GiftFilter); setPage(1); }}
          >
            <option value="all">Quà: Tất cả</option>
            <option value="cash">Tiền mặt</option>
            <option value="gold">Vàng</option>
            <option value="gift">Quà tặng</option>
            <option value="none">Không có</option>
          </select>
          <select
            className="rounded-lg border border-neutral-200 px-2 py-2 text-sm outline-none focus:border-rose-400"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="created_at">Ngày thêm</option>
            <option value="name">Tên A-Z</option>
            <option value="gift_amount">Số tiền quà</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="cursor-pointer accent-rose-500"
                  />
                </th>
                <th className="p-3 text-left">Tên khách</th>
                <th className="p-3 text-left">Nhóm</th>
                <th className="p-3 text-center">Số khách</th>
                <th className="p-3 text-left">Tham dự</th>
                <th className="p-3 text-left">Quà</th>
                <th className="p-3 text-left">Lời mời</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    Không tìm thấy khách nào
                  </td>
                </tr>
              ) : (
                paginated.map((g) => {
                  const grp = groups.find((x) => x.id === g.group_id);
                  const attendLabel =
                    g.attending === true
                      ? "Tham dự"
                      : g.attending === false
                      ? "Vắng mặt"
                      : "Chưa phản hồi";
                  const attendColor =
                    g.attending === true
                      ? "bg-green-100 text-green-700"
                      : g.attending === false
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700";
                  return (
                    <tr
                      key={g.id}
                      className={`border-b last:border-0 transition hover:bg-rose-50/30 ${
                        selected.has(g.id) ? "bg-rose-50" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(g.id)}
                          onChange={() =>
                            setSelected((prev) => {
                              const n = new Set(prev);
                              if (n.has(g.id)) { n.delete(g.id); } else { n.add(g.id); }
                              return n;
                            })
                          }
                          className="cursor-pointer accent-rose-500"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-neutral-800">{g.name}</div>
                        {g.phone && (
                          <div className="text-xs text-neutral-400">{g.phone}</div>
                        )}
                      </td>
                      <td className="p-3">
                        {grp ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: grp.color + "22",
                              color: grp.color,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: grp.color }}
                            />
                            {grp.name}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center text-neutral-700">{g.num_guests}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${attendColor}`}>
                          {attendLabel}
                        </span>
                      </td>
                      <td className="p-3">
                        {g.gift_type ? (
                          <div>
                            <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                              {GIFT_LABELS[g.gift_type]}
                            </span>
                            {g.gift_amount && g.gift_type === "cash" && (
                              <div className="mt-0.5 text-xs text-neutral-500">
                                {formatVND(g.gift_amount)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {g.invite_sent ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Đã gửi
                          </span>
                        ) : (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                            Chưa gửi
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(g)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Sửa
                          </button>
                          {g.email && (
                            <button
                              type="button"
                              onClick={() => void sendInvite(g)}
                              className="text-xs text-green-600 hover:underline"
                            >
                              Gửi thiệp
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void deleteGuest(g.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Hiển thị</span>
            <select
              className="rounded-lg border border-neutral-200 px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>/ trang — Tổng {filtered.length} khách</span>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-neutral-50"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`dot-${p}`} className="px-1 py-1 text-sm text-neutral-400">…</span>
                  )}
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`rounded-lg border px-3 py-1 text-sm ${
                      page === p
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </button>
                </>
              ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-neutral-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-neutral-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ── Guest Modal ────────────────────────────────────────────────────── */}
      {guestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-neutral-800">
              {editingGuest ? "Sửa thông tin khách" : "Thêm khách mời"}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">
                  Tên khách <span className="text-red-500">*</span>
                </span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  placeholder="Họ và tên"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-600">Điện thoại</span>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                    placeholder="0xxxxxxxxx"
                    value={gPhone}
                    onChange={(e) => setGPhone(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-600">Email</span>
                  <input
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                    placeholder="email@..."
                    value={gEmail}
                    onChange={(e) => setGEmail(e.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">Nhóm khách</span>
                <select
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  value={gGroupId}
                  onChange={(e) => setGGroupId(e.target.value)}
                >
                  <option value="">— Không phân nhóm —</option>
                  {groups.map((grp) => (
                    <option key={grp.id} value={grp.id}>{grp.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-600">Số khách</span>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                    value={gNumGuests}
                    onChange={(e) => setGNumGuests(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-600">Loại quà</span>
                  <select
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                    value={gGiftType}
                    onChange={(e) => setGGiftType(e.target.value as "cash" | "gold" | "gift" | "")}
                  >
                    <option value="">— Không —</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="gold">Vàng</option>
                    <option value="gift">Quà tặng</option>
                  </select>
                </label>
              </div>
              {gGiftType === "cash" && (
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-neutral-600">Số tiền (VND)</span>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                    placeholder="VD: 500000"
                    value={gGiftAmount}
                    onChange={(e) => setGGiftAmount(e.target.value)}
                  />
                </label>
              )}
              {gModalError && <p className="text-sm text-red-500">{gModalError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm"
                onClick={() => setGuestModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={gModalLoading}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                onClick={() => void saveGuest()}
              >
                {gModalLoading ? "Đang lưu..." : editingGuest ? "Cập nhật" : "Thêm khách"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Group Modal ────────────────────────────────────────────────────── */}
      {groupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-neutral-800">Tạo nhóm khách</h2>
            <div className="mt-4 space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">Tên nhóm</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  placeholder="VD: Họ nhà trai, Bạn bè..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </label>
              <div>
                <span className="mb-2 block text-sm font-medium text-neutral-600">Màu nhóm</span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewGroupColor(c)}
                      className={`h-7 w-7 rounded-full transition ${
                        newGroupColor === c ? "ring-2 ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm"
                onClick={() => setGroupModal(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={groupLoading}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                onClick={() => void createGroup()}
              >
                {groupLoading ? "Đang tạo..." : "Tạo nhóm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
