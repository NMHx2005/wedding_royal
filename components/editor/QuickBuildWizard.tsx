"use client";

import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { generateElementId } from "@/components/editor/utils/elementId";

// ─── Skeleton layouts ─────────────────────────────────────────────────────────

interface SkeletonLayout {
  id: string;
  label: string;
  description: string;
  generate: (data: WizardData) => Record<string, unknown>;
}

interface WizardData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  coverImage: string;
}

function buildMinimalJson(data: WizardData): Record<string, unknown> {
  const heroText = `${data.brideName} & ${data.groomName}`;
  const dateStr = data.weddingDate
    ? new Date(data.weddingDate).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "Ngày trọng đại";

  return {
    ROOT: {
      type: { resolvedName: "RootCanvas" },
      isCanvas: true,
      props: {},
      displayName: "RootCanvas",
      custom: {},
      hidden: false,
      nodes: ["section-hero"],
      linkedNodes: {},
    },
    "section-hero": {
      type: { resolvedName: "SectionBlock" },
      isCanvas: true,
      props: {
        height: 600,
        bgType: data.coverImage ? "image" : "gradient",
        bgUrl: data.coverImage,
        bgSize: "cover",
        bgPosition: "center center",
        gradientFrom: "#ea6c88",
        gradientTo: "#f5a623",
        gradientAngle: 135,
        overlayType: data.coverImage ? "color" : "none",
        overlayColor: "#000000",
        overlayOpacity: data.coverImage ? 30 : 0,
        elementId: "hero-section",
      },
      displayName: "Section",
      custom: {},
      hidden: false,
      nodes: ["text-invite", "text-names", "text-date", "text-venue"],
      linkedNodes: {},
      parent: "ROOT",
    },
    "text-invite": {
      type: { resolvedName: "TextBlock" },
      isCanvas: false,
      props: {
        content: "Trân trọng kính mời",
        fontSize: 14,
        color: data.coverImage ? "#ffffff" : "#999999",
        textAlign: "center",
        top: 60,
        left: 20,
        width: 350,
        fontFamily: "serif",
        fontWeight: "normal",
        elementId: "text-invite",
      },
      displayName: "Text",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "section-hero",
    },
    "text-names": {
      type: { resolvedName: "TextBlock" },
      isCanvas: false,
      props: {
        content: heroText,
        fontSize: 32,
        colorType: "solid",
        color: data.coverImage ? "#ffffff" : "#8b5e52",
        textAlign: "center",
        top: 100,
        left: 20,
        width: 350,
        fontFamily: "'Playfair Display', serif",
        fontWeight: "bold",
        elementId: "text-names",
      },
      displayName: "Text",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "section-hero",
    },
    "text-date": {
      type: { resolvedName: "TextBlock" },
      isCanvas: false,
      props: {
        content: dateStr,
        fontSize: 13,
        color: data.coverImage ? "#f0d9c0" : "#777777",
        textAlign: "center",
        top: 200,
        left: 20,
        width: 350,
        fontFamily: "serif",
        elementId: "text-date",
      },
      displayName: "Text",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "section-hero",
    },
    "text-venue": {
      type: { resolvedName: "TextBlock" },
      isCanvas: false,
      props: {
        content: data.venueName || "Địa điểm tổ chức",
        fontSize: 13,
        color: data.coverImage ? "#e0d0c0" : "#888888",
        textAlign: "center",
        top: 240,
        left: 20,
        width: 350,
        fontFamily: "serif",
        elementId: "text-venue",
      },
      displayName: "Text",
      custom: {},
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "section-hero",
    },
  };
}

function buildClassicJson(data: WizardData): Record<string, unknown> {
  const base = buildMinimalJson(data);
  const venueLine = [data.venueName, data.venueAddress].filter(Boolean).join(" — ") || "Địa điểm tổ chức";
  const inviteSectionId = "section-invite";
  const giftSectionId = "section-gift";

  const root = base.ROOT as { nodes: string[] };
  root.nodes = [...root.nodes, inviteSectionId, giftSectionId];

  base[inviteSectionId] = {
    type: { resolvedName: "SectionBlock" },
    isCanvas: true,
    props: {
      height: 480,
      bgType: "color",
      bgColor: "#fff8f5",
      elementId: generateElementId(),
    },
    displayName: "Section",
    custom: {},
    hidden: false,
    nodes: ["text-invite-body", "text-venue-detail"],
    linkedNodes: {},
    parent: "ROOT",
  };
  base["text-invite-body"] = {
    type: { resolvedName: "TextBlock" },
    isCanvas: false,
    props: {
      content: `Trân trọng kính mời quý khách đến dự lễ thành hôn của<br/><strong>${data.brideName}</strong> & <strong>${data.groomName}</strong>`,
      fontSize: 16,
      color: "#444444",
      textAlign: "center",
      top: 48,
      left: 20,
      width: 350,
      fontFamily: "serif",
      elementId: generateElementId(),
    },
    displayName: "Text",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: inviteSectionId,
  };
  base["text-venue-detail"] = {
    type: { resolvedName: "TextBlock" },
    isCanvas: false,
    props: {
      content: venueLine,
      fontSize: 14,
      color: "#8b5e52",
      textAlign: "center",
      top: 200,
      left: 20,
      width: 350,
      elementId: generateElementId(),
    },
    displayName: "Text",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: inviteSectionId,
  };

  base[giftSectionId] = {
    type: { resolvedName: "SectionBlock" },
    isCanvas: true,
    props: {
      height: 360,
      bgType: "color",
      bgColor: "#1a1a2e",
      elementId: generateElementId(),
    },
    displayName: "Section",
    custom: {},
    hidden: false,
    nodes: ["gift-box-main"],
    linkedNodes: {},
    parent: "ROOT",
  };
  base["gift-box-main"] = {
    type: { resolvedName: "GiftBoxBlock" },
    isCanvas: false,
    props: {
      top: 30,
      left: 5,
      width: 380,
      height: 300,
      bgColor: "#1a1a2e",
      titleColor: "#ffffff",
      textColor: "#cccccc",
      elementId: generateElementId(),
    },
    displayName: "Hộp mừng cưới",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: giftSectionId,
  };

  return base;
}

function buildModernJson(data: WizardData): Record<string, unknown> {
  const base = buildMinimalJson(data);
  const countdownSectionId = "section-countdown";
  const gallerySectionId = "section-gallery";

  const root = base.ROOT as { nodes: string[] };
  root.nodes = [...root.nodes, countdownSectionId, gallerySectionId];

  base[countdownSectionId] = {
    type: { resolvedName: "SectionBlock" },
    isCanvas: true,
    props: {
      height: 220,
      bgType: "gradient",
      gradientFrom: "#6366f1",
      gradientTo: "#a855f7",
      gradientAngle: 90,
      elementId: generateElementId(),
    },
    displayName: "Section",
    custom: {},
    hidden: false,
    nodes: ["countdown-main"],
    linkedNodes: {},
    parent: "ROOT",
  };
  base["countdown-main"] = {
    type: { resolvedName: "CountdownBlock" },
    isCanvas: false,
    props: {
      top: 40,
      left: 20,
      width: 350,
      primaryColor: "#ffffff",
      textColor: "#ffffff",
      labelColor: "#e0e7ff",
      digitFontSize: 28,
      elementId: generateElementId(),
    },
    displayName: "Đếm ngược",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: countdownSectionId,
  };

  base[gallerySectionId] = {
    type: { resolvedName: "SectionBlock" },
    isCanvas: true,
    props: {
      height: 400,
      bgType: "color",
      bgColor: "#fafafa",
      elementId: generateElementId(),
    },
    displayName: "Section",
    custom: {},
    hidden: false,
    nodes: ["gallery-title", "gallery-image"],
    linkedNodes: {},
    parent: "ROOT",
  };
  base["gallery-title"] = {
    type: { resolvedName: "TextBlock" },
    isCanvas: false,
    props: {
      content: "Khoảnh khắc của chúng mình",
      fontSize: 22,
      color: "#333333",
      textAlign: "center",
      top: 32,
      left: 20,
      width: 350,
      fontFamily: "'Playfair Display', serif",
      elementId: generateElementId(),
    },
    displayName: "Text",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: gallerySectionId,
  };
  base["gallery-image"] = {
    type: { resolvedName: "ImageBlock" },
    isCanvas: false,
    props: {
      src: data.coverImage || "",
      top: 90,
      left: 45,
      width: 300,
      height: 280,
      elementId: generateElementId(),
    },
    displayName: "Hình ảnh",
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: gallerySectionId,
  };

  return base;
}

const SKELETON_LAYOUTS: SkeletonLayout[] = [
  {
    id: "minimal",
    label: "Tối giản",
    description: "1 section hero với tên cô dâu chú rể và ngày cưới",
    generate: buildMinimalJson,
  },
  {
    id: "classic",
    label: "Cổ điển",
    description: "3 section: Hero, Thông tin lễ cưới, Hộp mừng cưới",
    generate: buildClassicJson,
  },
  {
    id: "modern",
    label: "Hiện đại",
    description: "Hero + đếm ngược + gallery ảnh",
    generate: buildModernJson,
  },
];

// ─── Wizard component ─────────────────────────────────────────────────────────

interface QuickBuildWizardProps {
  onClose: () => void;
}

export function QuickBuildWizard({ onClose }: QuickBuildWizardProps) {
  const { actions } = useEditor();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    brideName: "",
    groomName: "",
    weddingDate: "",
    venueName: "",
    venueAddress: "",
    coverImage: "",
  });
  const [selectedLayout, setSelectedLayout] = useState("minimal");

  const handleGenerate = () => {
    const layout = SKELETON_LAYOUTS.find((l) => l.id === selectedLayout) ?? SKELETON_LAYOUTS[0];
    const contentJson = layout.generate(data);
    try {
      actions.deserialize(JSON.stringify(contentJson));
      onClose();
    } catch {
      alert("Không thể tạo thiệp. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Làm thiệp nhanh</h3>
            <p className="text-xs text-gray-400">Bước {step}/3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 shrink-0">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Nhập thông tin cơ bản để tự động điền vào thiệp.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "brideName", label: "Tên cô dâu *", placeholder: "Nguyễn Thị A" },
                  { key: "groomName", label: "Tên chú rể *", placeholder: "Trần Văn B" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type="text"
                      value={data[key as keyof WizardData]}
                      onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ngày cưới</label>
                <input
                  type="date"
                  value={data.weddingDate}
                  onChange={(e) => setData((d) => ({ ...d, weddingDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tên địa điểm</label>
                <input
                  type="text"
                  value={data.venueName}
                  onChange={(e) => setData((d) => ({ ...d, venueName: e.target.value }))}
                  placeholder="Trung tâm tiệc cưới ABC"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Địa chỉ</label>
                <input
                  type="text"
                  value={data.venueAddress}
                  onChange={(e) => setData((d) => ({ ...d, venueAddress: e.target.value }))}
                  placeholder="Số nhà, quận, thành phố"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ảnh bìa (URL)</label>
                <input
                  type="text"
                  value={data.coverImage}
                  onChange={(e) => setData((d) => ({ ...d, coverImage: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Chọn bố cục khung thiệp.</p>
              {SKELETON_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedLayout === layout.id
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedLayout === layout.id ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                      }`}
                    >
                      {selectedLayout === layout.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{layout.label}</p>
                      <p className="text-xs text-gray-400">{layout.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Xác nhận thông tin trước khi tạo thiệp.</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex gap-2"><span className="text-gray-400 w-24">Cô dâu:</span><span className="text-gray-700 font-medium">{data.brideName || "—"}</span></div>
                <div className="flex gap-2"><span className="text-gray-400 w-24">Chú rể:</span><span className="text-gray-700 font-medium">{data.groomName || "—"}</span></div>
                <div className="flex gap-2"><span className="text-gray-400 w-24">Ngày cưới:</span><span className="text-gray-700">{data.weddingDate ? new Date(data.weddingDate).toLocaleDateString("vi-VN") : "—"}</span></div>
                <div className="flex gap-2"><span className="text-gray-400 w-24">Địa điểm:</span><span className="text-gray-700">{data.venueName || "—"}</span></div>
                <div className="flex gap-2"><span className="text-gray-400 w-24">Bố cục:</span><span className="text-gray-700">{SKELETON_LAYOUTS.find((l) => l.id === selectedLayout)?.label}</span></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">Tạo thiệp mới sẽ thay thế nội dung editor hiện tại. Hãy lưu trước nếu cần.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t border-gray-100 shrink-0">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Quay lại
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && (!data.brideName.trim() || !data.groomName.trim())}
              className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Tạo thiệp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
