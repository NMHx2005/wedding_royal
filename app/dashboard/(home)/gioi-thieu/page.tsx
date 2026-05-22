import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GioiThieuClient from "./GioiThieuClient";

export const metadata = { title: "Giới thiệu & Hoa hồng" };

export default async function GioiThieuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("payout_bank_code, payout_account_number, payout_account_name")
    .eq("id", user.id)
    .single();

  const [
    { data: refCode },
    { data: referrals },
    { data: withdrawals },
  ] = await Promise.all([
    supabase
      .from("referral_codes")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("referrals")
      .select("*, referred_user:profiles!referred_user_id(full_name, created_at)")
      .eq("referrer_id", user.id),
    supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Fetch commissions via referrals for this user
  const referralIds = (referrals ?? []).map((r: { id: string }) => r.id);
  const { data: userCommissions } =
    referralIds.length > 0
      ? await supabase
          .from("commissions")
          .select("*")
          .in("referral_id", referralIds)
      : { data: [] };

  return (
    <GioiThieuClient
      userId={user.id}
      initialRefCode={refCode ?? null}
      initialReferrals={referrals ?? []}
      initialCommissions={userCommissions ?? []}
      initialWithdrawals={withdrawals ?? []}
      initialPayout={{
        bankCode: profile?.payout_bank_code ?? "",
        accountNumber: profile?.payout_account_number ?? "",
        accountName: profile?.payout_account_name ?? "",
      }}
    />
  );
}
