import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { TemplateEditorPageClient } from "./TemplateEditorPageClient";
import type { TemplateRow } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTemplateEditorPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  const admin = createServiceRoleClient();
  const { data: template } = await admin
    .from("templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!template) notFound();

  return <TemplateEditorPageClient template={template as TemplateRow} />;
}
