"use client";

import "animate.css";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Editor } from "@craftjs/core";
import { editorResolver } from "@/components/editor/resolver";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { LeftSidebar } from "@/components/editor/panels/LeftSidebar";
import { FloatingPropertyPanel } from "@/components/editor/panels/FloatingPropertyPanel";
import { EditorCardProvider } from "@/components/editor/EditorContext";
import { EditorUIProvider } from "@/components/editor/EditorUIContext";
import { EditorCanvasArea } from "@/components/editor/canvas/EditorCanvasArea";
import { migrateContentJson } from "@/lib/editor/migrateContentJson";
import { hasCardEditorContent } from "@/lib/editor/hasCardEditorContent";
import { saveCardContentJson } from "@/app/actions/wedding-card";
import type { WeddingCard } from "@/types";

interface Props {
  card: WeddingCard;
}

export function EditorClient({ card }: Props) {
  // `editorCard` reflects live DB metadata (names, date, etc.) but does NOT
  // drive the Craft canvas — Craft manages its own node state after initial load.
  const [editorCard, setEditorCard] = useState(card);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const dirtyRef = useRef(false);

  // Stable initial data for Frame — computed once from the server-provided card.
  // NEVER driven by editorCard.content_json; that would remount Frame on every save.
  const initialFrameData = useMemo(
    () => JSON.stringify(migrateContentJson(card.content_json as Record<string, unknown>)),
    // Intentionally omit card.content_json — only recompute if card.id changes (new page load)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card.id],
  );

  const patchCard = useCallback(
    (patch: Partial<WeddingCard>) => setEditorCard((prev) => ({ ...prev, ...patch })),
    [],
  );

  const handleSave = async (json: string): Promise<boolean> => {
    setSaveStatus("saving");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json) as Record<string, unknown>;
    } catch {
      setSaveError("Dữ liệu thiệp không hợp lệ");
      setSaveStatus("error");
      return false;
    }

    try {
      const result = await saveCardContentJson(card.id, parsed);
      if (result.error) {
        setSaveError(result.error);
        setSaveStatus("error");
        return false;
      }
      setSaveError(null);
      setSaveStatus("saved");
      setPreviewVersion((v) => v + 1);
      dirtyRef.current = false;
      // Only sync DB-column fields back (date, names) — do NOT update content_json
      // here because that would change frameKey and remount the Craft canvas,
      // losing all unsaved in-memory edits (drag positions, etc.).
      // revalidatePath() in the server action ensures /thiep/[slug] shows fresh data.
      if (result.fieldPatch) {
        setEditorCard((prev) => ({ ...prev, ...result.fieldPatch }));
      }
      setTimeout(() => setSaveStatus("idle"), 2000);
      return true;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Lỗi không xác định");
      setSaveStatus("error");
      return false;
    }
  };

  if (!hasCardEditorContent(card.content_json)) {
    return null;
  }

  return (
    <EditorCardProvider card={editorCard} patchCard={patchCard}>
      <Editor
        resolver={editorResolver}
        enabled
        onNodesChange={() => {
          dirtyRef.current = true;
        }}
      >
        <EditorUIProvider>
          <div className="flex flex-col h-screen">
            <EditorHeader
              onSave={handleSave}
              saving={saveStatus === "saving"}
              saveStatus={saveStatus}
              dirtyRef={dirtyRef}
              previewHref={
                card.slug ? `/thiep/${card.slug}?v=${previewVersion}` : undefined
              }
            />

            {saveStatus === "saved" && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
                ✓ Đã lưu thành công
              </div>
            )}
            {saveStatus === "error" && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-md bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 text-center">
                ✕ Lưu thất bại{saveError ? `: ${saveError}` : ""}
              </div>
            )}

            <div className="flex flex-1 overflow-hidden">
              <LeftSidebar />

              <div className="flex-1 min-w-0 relative flex flex-col overflow-hidden">
                {/* frameKey is stable (card.id) — Frame mounts once and keeps its
                    node state for the entire editing session. Saving must not remount. */}
                <EditorCanvasArea
                  frameKey={card.id}
                  frameData={initialFrameData}
                />
                <FloatingPropertyPanel />
              </div>
            </div>
          </div>
        </EditorUIProvider>
      </Editor>
    </EditorCardProvider>
  );
}
