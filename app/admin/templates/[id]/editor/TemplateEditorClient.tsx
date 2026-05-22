"use client";

import "animate.css";
import React, { useRef, useState, useTransition } from "react";
import { Editor, Element } from "@craftjs/core";
import { editorResolver } from "@/components/editor/resolver";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { LeftSidebar } from "@/components/editor/panels/LeftSidebar";
import { FloatingPropertyPanel } from "@/components/editor/panels/FloatingPropertyPanel";
import { EditorUIProvider } from "@/components/editor/EditorUIContext";
import { QuickBuildWizard } from "@/components/editor/QuickBuildWizard";
import { EditorCanvasArea } from "@/components/editor/canvas/EditorCanvasArea";
import { SectionBlock } from "@/components/editor/blocks/SectionBlock";
import { TextBlock } from "@/components/editor/blocks/TextBlock";
import { RootCanvas } from "@/components/editor/blocks/RootCanvas";
import { EditorCardProvider } from "@/components/editor/EditorContext";
import { generateElementId } from "@/components/editor/utils/elementId";
import { saveTemplateContentJson } from "@/app/actions/admin";
import { migrateContentJson } from "@/lib/editor/migrateContentJson";
import type { TemplateRow, WeddingCard } from "@/types";

// Placeholder card so blocks that read card data (Countdown, GiftBox) don't crash
const PLACEHOLDER_CARD: WeddingCard = {
  id: "preview",
  user_id: "",
  slug: "preview",
  plan: "basic",
  status: "draft",
  bride_name: "Cô dâu",
  bride_parents: null,
  groom_name: "Chú rể",
  groom_parents: null,
  wedding_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  ceremony_time: null,
  reception_time: null,
  venue_name: null,
  venue_address: null,
  venue_maps_url: null,
  love_story: null,
  hashtag: null,
  background_music_url: null,
  cover_image_url: null,
  template_id: "",
  primary_color: "#ea6c88",
  font_family: "serif",
  confetti_effect: "none",
  paid_at: null,
  payment_order_id: null,
  show_gift_box: false,
  gift_bank_name: null,
  gift_account_number: null,
  gift_account_name: null,
  gift_qr_url: null,
  remove_branding: false,
  custom_domain: null,
  view_count: 0,
  content_json: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOBILE_WIDTH = 390;

export function TemplateEditorClient({ template }: { template: TemplateRow }) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const [showWizard, setShowWizard] = useState(false);
  const dirtyRef = useRef(false);

  const handleSave = async (json: string): Promise<boolean> => {
    setSaveStatus("saving");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(json) as Record<string, unknown>;
    } catch {
      setSaveStatus("error");
      return false;
    }

    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const result = await saveTemplateContentJson(template.id, parsed);
          if (result.error) {
            setSaveStatus("error");
            resolve(false);
          } else {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
            resolve(true);
          }
        } catch {
          setSaveStatus("error");
          resolve(false);
        }
      });
    });
  };

  const hasContent = !!template.content_json;
  const migratedContent = hasContent
    ? migrateContentJson(template.content_json as Record<string, unknown>)
    : null;

  return (
    <EditorCardProvider card={PLACEHOLDER_CARD} uploadScopeId={`templates/${template.id}`}>
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
            title={`Template: ${template.name}`}
            backHref="/admin/templates"
            onSave={handleSave}
            saving={isPending || saveStatus === "saving"}
            saveStatus={saveStatus}
            dirtyRef={dirtyRef}
            onQuickBuild={() => setShowWizard(true)}
          />
          {showWizard && <QuickBuildWizard onClose={() => setShowWizard(false)} />}

          {saveStatus === "saved" && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50">
              ✓ Đã lưu template
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            <LeftSidebar />

            <div className="flex-1 min-w-0 relative flex flex-col overflow-hidden">
              <EditorCanvasArea
                frameData={migratedContent ? JSON.stringify(migratedContent) : undefined}
              >
                {!hasContent && (
                  <Element is={RootCanvas} canvas>
                    <Element
                      is={SectionBlock}
                      canvas
                      height={600}
                      bgType="color"
                      bgColor="#fdf6f0"
                      elementId={generateElementId()}
                    >
                      <TextBlock
                        content="Trân trọng kính mời"
                        fontSize={16}
                        color="#999999"
                        textAlign="center"
                        top={60}
                        left={20}
                        width={MOBILE_WIDTH - 40}
                        elementId={generateElementId()}
                      />
                      <TextBlock
                        content="Tên cô dâu & Tên chú rể"
                        fontSize={30}
                        fontFamily="'Playfair Display', serif"
                        color="#8b5e52"
                        textAlign="center"
                        top={100}
                        left={20}
                        width={MOBILE_WIDTH - 40}
                        elementId={generateElementId()}
                      />
                    </Element>
                  </Element>
                )}
              </EditorCanvasArea>
              <FloatingPropertyPanel />
            </div>
          </div>
        </div>
        </EditorUIProvider>
      </Editor>
    </EditorCardProvider>
  );
}
