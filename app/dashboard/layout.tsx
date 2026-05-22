import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Wedding Manager | Royal Wedding",
};

/** Auth shell only — chrome is applied in (home) or [cardId] layouts to avoid nested sidebars. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
