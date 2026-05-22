import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trình chỉnh sửa thiệp | Royal Wedding",
};

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Full-screen editor — no sidebar/navbar, just the page content
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      {children}
    </div>
  );
}
