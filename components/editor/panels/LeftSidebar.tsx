"use client";

import React, { useState } from "react";
import { ElementLibrary } from "./ElementLibrary";
import { LayerPanel } from "./LayerPanel";
import { SavedTemplatesPanel } from "./SavedTemplatesPanel";
import { HistoryPanel } from "./HistoryPanel";

type Tab = "library" | "layers" | "saved" | "history";

export function LeftSidebar() {
  const [tab, setTab] = useState<Tab>("library");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative flex flex-col shrink-0" style={{ width: isOpen ? 192 : 32 }}>
      {/* Toggle button — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        title={isOpen ? "Thu gọn sidebar" : "Mở sidebar"}
        className="absolute -right-3 top-4 z-20 w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Sidebar content */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col overflow-hidden h-full transition-all duration-200 ${
          isOpen ? "w-48 opacity-100" : "w-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex border-b border-gray-100 shrink-0 flex-wrap">
          {(["library", "layers", "saved", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 text-xs py-2 min-w-0 ${
                tab === t
                  ? "text-indigo-600 border-b-2 border-indigo-500 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "library" ? "TV" : t === "layers" ? "Lớp" : t === "saved" ? "Mẫu" : "LS"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {tab === "library" && <ElementLibrary />}
          {tab === "layers" && <LayerPanel />}
          {tab === "saved" && <SavedTemplatesPanel />}
          {tab === "history" && <HistoryPanel />}
        </div>
      </aside>
    </div>
  );
}
