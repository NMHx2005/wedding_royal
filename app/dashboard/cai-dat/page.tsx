import { createClient } from "@/lib/supabase/server";

export default async function CaiDatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Cài đặt tài khoản</h1>
      <div className="rounded-xl border border-neutral-100 bg-white p-4 text-sm">
        <p>
          <span className="text-neutral-500">Email:</span> {user?.email}
        </p>
        <p className="mt-2">
          <span className="text-neutral-500">Họ tên:</span> {profile?.full_name ?? "—"}
        </p>
      </div>
    </div>
  );
}
