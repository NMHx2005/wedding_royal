"use client";

import dynamic from "next/dynamic";
import { EditorLoadingShell } from "@/components/editor/EditorLoadingShell";
import type { WeddingCard } from "@/types";

const EditorClient = dynamic(
  () => import("./EditorClient").then((m) => m.EditorClient),
  { ssr: false, loading: () => <EditorLoadingShell /> }
);

export function EditorPageClient({ card }: { card: WeddingCard }) {
  return <EditorClient card={card} />;
}
