"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  ReferralCode,
  Referral,
  Commission,
  CommissionStatus,
  WithdrawalRequest,
  WithdrawalStatus,
} from "@/types";

type ReferralWithUser = Referral & {
  referred_user?: { full_name: string | null; created_at: string } | null;
};

type PayoutInfo = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

type Props = {
  userId: string;
  initialRefCode: ReferralCode | null;
  initialReferrals: ReferralWithUser[];
  initialCommissions: Commission[];
  initialWithdrawals: WithdrawalRequest[];
  initialPayout: PayoutInfo;
};

type Tab =
  | "overview"
  | "bank"
  | "commissions"
  | "referrals"
  | "withdrawals";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Tổng quan" },
  { key: "bank", label: "Ngân hàng" },
  { key: "commissions", label: "Lịch sử hoa hồng" },
  { key: "referrals", label: "Người được giới thiệu" },
  { key: "withdrawals", label: "Lịch sử rút tiền" },
];

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Chờ duyệt",
  available: "Khả dụng",
  paid: "Đã trả",
  canceled: "Đã hủy",
};

const STATUS_COLORS: Record<CommissionStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  available: "bg-green-100 text-green-700",
  paid: "bg-blue-100 text-blue-700",
  canceled: "bg-neutral-100 text-neutral-500",
};

const W_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  paid: "Đã thanh toán",
  rejected: "Bị từ chối",
};

const W_STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function GioiThieuClient({
  userId,
  initialRefCode,
  initialReferrals,
  initialCommissions,
  initialWithdrawals,
  initialPayout,
}: Props) {
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("overview");
  const [refCode, setRefCode] = useState<ReferralCode | null>(initialRefCode);
  const [commissions] = useState<Commission[]>(initialCommissions);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(initialWithdrawals);

  const [bankCode, setBankCode] = useState(initialPayout.bankCode);
  const [accountNumber, setAccountNumber] = useState(initialPayout.accountNumber);
  const [accountName, setAccountName] = useState(initialPayout.accountName);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankMsg, setBankMsg] = useState("");

  // Withdrawal modal
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wBankCode, setWBankCode] = useState(initialPayout.bankCode);
  const [wAccountNumber, setWAccountNumber] = useState(initialPayout.accountNumber);
  const [wAccountName, setWAccountName] = useState(initialPayout.accountName);
  const [wLoading, setWLoading] = useState(false);
  const [wError, setWError] = useState("");

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const referralLink =
    typeof window !== "undefined" && refCode
      ? `${window.location.origin}/dang-ky?ref=${refCode.code}`
      : "";

  // Auto-create referral code if none
  useEffect(() => {
    if (refCode) return;
    const create = async () => {
      const code = generateCode();
      const { data } = await supabase
        .from("referral_codes")
        .insert({ user_id: userId, code })
        .select("*")
        .single();
      if (data) setRefCode(data as ReferralCode);
    };
    void create();
  }, []);

  const copyText = async (text: string, which: "link" | "code") => {
    await navigator.clipboard.writeText(text);
    if (which === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const availableTotal = commissions
    .filter((c) => c.status === "available")
    .reduce((s, c) => s + c.amount, 0);
  const paidTotal = withdrawals
    .filter((w) => w.status === "paid")
    .reduce((s, w) => s + w.amount, 0);

  const handleWithdraw = async () => {
    setWError("");
    const amt = Number(wAmount);
    if (!amt || amt <= 0) {
      setWError("Nhập số tiền hợp lệ");
      return;
    }
    if (amt > availableTotal) {
      setWError("Số tiền vượt quá hoa hồng khả dụng");
      return;
    }
    if (!wBankCode || !wAccountNumber || !wAccountName) {
      setWError("Vui lòng nhập đầy đủ thông tin ngân hàng");
      return;
    }
    setWLoading(true);
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .insert({
        user_id: userId,
        amount: amt,
        bank_code: wBankCode,
        account_number: wAccountNumber,
        account_name: wAccountName,
        status: "pending",
      })
      .select("*")
      .single();
    setWLoading(false);
    if (error) {
      setWError(error.message);
      return;
    }
    if (data) setWithdrawals((prev) => [data as WithdrawalRequest, ...prev]);
    setWithdrawModal(false);
    setWAmount("");
    setWBankCode("");
    setWAccountNumber("");
    setWAccountName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-800">Giới thiệu &amp; Hoa hồng</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Chia sẻ link để nhận hoa hồng khi bạn bè đăng ký dịch vụ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-rose-500 text-rose-600"
                : "text-neutral-600 hover:text-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Tổng quan */}
      {tab === "overview" && (
        <div className="space-y-5">
          {/* Referral link */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Link giới thiệu của bạn
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={referralLink || "Đang tạo link..."}
                className="flex-1 truncate rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none"
              />
              <button
                type="button"
                onClick={() => referralLink && void copyText(referralLink, "link")}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
              >
                {copiedLink ? "Đã copy!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Referral code */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Mã giới thiệu
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-base font-bold tracking-widest text-rose-500">
                {refCode?.code ?? "..."}
              </span>
              <button
                type="button"
                onClick={() => refCode && void copyText(refCode.code, "code")}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
              >
                {copiedCode ? "Đã copy!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <p className="text-xs text-neutral-500">Số người giới thiệu</p>
              <p className="mt-1 text-3xl font-bold text-neutral-800">
                {initialReferrals.length}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <p className="text-xs text-neutral-500">Hoa hồng khả dụng</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatVND(availableTotal)}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
              <p className="text-xs text-neutral-500">Đã rút tiền</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {formatVND(paidTotal)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWithdrawModal(true)}
            disabled={availableTotal === 0}
            className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Rút tiền
          </button>
        </div>
      )}

      {/* Tab: Ngân hàng */}
      {tab === "bank" && (
        <div className="max-w-md space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-800">Thông tin ngân hàng</h2>
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-600">Ngân hàng</span>
              <input
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                placeholder="VD: Vietcombank, BIDV..."
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-600">Số tài khoản</span>
              <input
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                placeholder="Nhập số tài khoản"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-600">Tên chủ tài khoản</span>
              <input
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300"
                placeholder="Nhập tên in hoa"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={bankSaving}
            onClick={async () => {
              setBankSaving(true);
              setBankMsg("");
              const { error } = await supabase
                .from("profiles")
                .update({
                  payout_bank_code: bankCode || null,
                  payout_account_number: accountNumber || null,
                  payout_account_name: accountName || null,
                })
                .eq("id", userId);
              setBankSaving(false);
              if (error) setBankMsg(`Lỗi: ${error.message}`);
              else {
                setBankMsg("Đã lưu thành công!");
                setWBankCode(bankCode);
                setWAccountNumber(accountNumber);
                setWAccountName(accountName);
              }
            }}
            className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {bankSaving ? "Đang lưu..." : "Lưu thông tin"}
          </button>
          {bankMsg && (
            <p className={`text-sm font-medium ${bankMsg.startsWith("Lỗi") ? "text-red-500" : "text-green-600"}`}>
              {bankMsg}
            </p>
          )}
        </div>
      )}

      {/* Tab: Lịch sử hoa hồng */}
      {tab === "commissions" && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Số tiền</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-neutral-400">
                    Chưa có hoa hồng nào
                  </td>
                </tr>
              ) : (
                commissions.map((c, i) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-rose-50/30">
                    <td className="p-4 text-neutral-500">{i + 1}</td>
                    <td className="p-4 font-semibold text-neutral-800">
                      {formatVND(c.amount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}
                      >
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500">{formatDate(c.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Người được giới thiệu */}
      {tab === "referrals" && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Tên</th>
                <th className="p-4 text-left">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {initialReferrals.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-neutral-400">
                    Chưa có ai được giới thiệu. Hãy chia sẻ link của bạn!
                  </td>
                </tr>
              ) : (
                initialReferrals.map((r, i) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-rose-50/30">
                    <td className="p-4 text-neutral-500">{i + 1}</td>
                    <td className="p-4 font-medium text-neutral-800">
                      {r.referred_user?.full_name ?? "Ẩn danh"}
                    </td>
                    <td className="p-4 text-neutral-500">
                      {r.referred_user ? formatDate(r.referred_user.created_at) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Lịch sử rút tiền */}
      {tab === "withdrawals" && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-4 text-left">Số tiền</th>
                <th className="p-4 text-left">Ngân hàng</th>
                <th className="p-4 text-left">Tài khoản</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-400">
                    Chưa có yêu cầu rút tiền nào
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="border-b last:border-0 hover:bg-rose-50/30">
                    <td className="p-4 font-semibold text-neutral-800">
                      {formatVND(w.amount)}
                    </td>
                    <td className="p-4 text-neutral-600">{w.bank_code ?? "—"}</td>
                    <td className="p-4 text-neutral-600">{w.account_number ?? "—"}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${W_STATUS_COLORS[w.status]}`}
                      >
                        {W_STATUS_LABELS[w.status]}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500">{formatDate(w.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdrawal Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-neutral-800">Yêu cầu rút tiền</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Hoa hồng khả dụng: <strong className="text-green-600">{formatVND(availableTotal)}</strong>
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">Số tiền muốn rút (VND)</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  placeholder="VD: 500000"
                  value={wAmount}
                  onChange={(e) => setWAmount(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">Ngân hàng</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  placeholder="VD: Vietcombank"
                  value={wBankCode}
                  onChange={(e) => setWBankCode(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">Số tài khoản</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  placeholder="Nhập số tài khoản"
                  value={wAccountNumber}
                  onChange={(e) => setWAccountNumber(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-neutral-600">Tên chủ tài khoản</span>
                <input
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                  placeholder="Tên in hoa"
                  value={wAccountName}
                  onChange={(e) => setWAccountName(e.target.value)}
                />
              </label>
              {wError && <p className="text-sm text-red-500">{wError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm"
                onClick={() => {
                  setWithdrawModal(false);
                  setWError("");
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={wLoading}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
                onClick={() => void handleWithdraw()}
              >
                {wLoading ? "Đang xử lý..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
