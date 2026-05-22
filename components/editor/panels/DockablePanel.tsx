/** @deprecated Use FloatingPropertyPanel instead. Kept for reference. */
"use client";

import React, { useCallback, useRef, useState } from "react";

interface DockablePanelProps {
  children: React.ReactNode;
  title?: string;
  defaultWidth?: number;
}

export function DockablePanel({ children, title = "Thuộc tính", defaultWidth = 256 }: DockablePanelProps) {
  const [undocked, setUndocked] = useState(false);
  const [pos, setPos] = useState({ x: window.innerWidth - defaultWidth - 16, y: 64 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (!undocked) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - defaultWidth, ev.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, ev.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [undocked, pos, defaultWidth]);

  if (undocked) {
    return (
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: defaultWidth,
          zIndex: 300,
          maxHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          borderRadius: 10,
          background: "#fff",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Drag handle */}
        <div
          onMouseDown={onDragStart}
          style={{ cursor: "move" }}
          className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 select-none shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
              <circle cx="5" cy="5" r="1.5" /><circle cx="11" cy="5" r="1.5" />
              <circle cx="5" cy="11" r="1.5" /><circle cx="11" cy="11" r="1.5" />
            </svg>
            <span className="text-xs font-medium text-gray-600">{title}</span>
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setUndocked(false)}
            title="Ghim lại vào sidebar"
            className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
          >
            Ghim
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return (
    <aside
      className="bg-white border-l border-gray-200 flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width: defaultWidth }}
    >
      {/* Panel header with undock trigger */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0">
        <span className="text-xs font-semibold text-gray-600">{title}</span>
        <button
          type="button"
          onClick={() => setUndocked(true)}
          title="Tách ra ngoài (undock)"
          className="text-gray-300 hover:text-indigo-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
