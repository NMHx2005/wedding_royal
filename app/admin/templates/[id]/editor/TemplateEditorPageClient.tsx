"use client";

import dynamic from "next/dynamic";
import { EditorLoadingShell } from "@/components/editor/EditorLoadingShell";
import type { TemplateRow } from "@/types";

const TemplateEditorClient = dynamic(
  () => import("./TemplateEditorClient").then((m) => m.TemplateEditorClient),
  { ssr: false, loading: () => <EditorLoadingShell /> }
);

export function TemplateEditorPageClient({ template }: { template: TemplateRow }) {
  return <TemplateEditorClient template={template} />;
}
