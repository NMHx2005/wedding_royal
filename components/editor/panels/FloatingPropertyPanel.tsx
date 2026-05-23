"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@craftjs/core";
import { ChevronDown, ChevronsLeft, GripVertical, SlidersHorizontal, X } from "lucide-react";
import { PropertyPanel } from "./PropertyPanel";
import { useEditorUI } from "@/components/editor/EditorUIContext";
import { PUBLISHED_CANVAS_WIDTH } from "@/lib/editor/canvasViewport";

const STORAGE_KEY = "editor-floating-panel";
const DEFAULT_WIDTH = 360;

type PanelMode = "collapsed" | "expanded";

interface StoredState {
  mode: PanelMode;
  x: number;
  y: number;
  width: number;
}

function clampPosition(x: number, y: number, width: number): { x: number; y: number } {
  if (typeof window === "undefined") return { x, y };
  const panelW = width > 0 ? width : DEFAULT_WIDTH;
  return {
    x: Math.max(8, Math.min(window.innerWidth - panelW - 8, x)),
    y: Math.max(56, Math.min(window.innerHeight - 120, y)),
  };
}

function loadState(): StoredState {
  if (typeof window === "undefined") {
    return { mode: "expanded", x: 0, y: 80, width: DEFAULT_WIDTH };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      const def = defaultPosition(parsed.width || DEFAULT_WIDTH, PUBLISHED_CANVAS_WIDTH);
      const x = parsed.x > 0 ? parsed.x : def.x;
      const y = parsed.y > 0 ? parsed.y : def.y;
      const clamped = clampPosition(x, y, parsed.width || DEFAULT_WIDTH);
      return { ...parsed, x: clamped.x, y: clamped.y };
    }
  } catch {
    /* ignore */
  }
  return { mode: "expanded", x: 0, y: 80, width: DEFAULT_WIDTH };
}

function saveState(s: StoredState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function defaultPosition(panelWidth: number, canvasWidth: number): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 80 };
  const leftSidebar = 176;
  const canvasLeft = leftSidebar + Math.max(0, (window.innerWidth - leftSidebar - canvasWidth) / 2);
  const x = Math.min(canvasLeft + canvasWidth + 16, window.innerWidth - panelWidth - 16);
  const y = Math.max(72, Math.min(120, window.innerHeight - 500));
  return { x, y };
}

export function FloatingPropertyPanel() {
  const { viewportWidth } = useEditorUI();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<PanelMode>("expanded");
  const [pos, setPos] = useState({ x: 0, y: 80 });
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [hidden, setHidden] = useState(false);
  const initialViewportWidthRef = useRef(viewportWidth);

  useEffect(() => {
    const initial = loadState();
    setMode(initial.mode);
    setWidth(initial.width);
    const def = defaultPosition(initial.width, initialViewportWidthRef.current);
    const x = initial.x > 0 ? initial.x : def.x;
    const y = initial.y > 0 ? initial.y : def.y;
    setPos(clampPosition(x, y, initial.width));
    setMounted(true);
  }, []);

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const { selectedName, elementId, hasSelection, selectedNodeId, actions } = useEditor((state) => {
    const selectedIds = Array.from(state.events.selected);
    const id = selectedIds[0];
    if (!id) return { selectedName: null, elementId: null, hasSelection: false, selectedNodeId: null };
    const node = state.nodes[id];
    if (!node) return { selectedName: null, elementId: null, hasSelection: false, selectedNodeId: null };
    const props = node.data.props as Record<string, unknown> | undefined;
    return {
      selectedName: (node.data.displayName ?? node.data.name) as string,
      elementId: (props?.elementId as string) ?? "",
      hasSelection: true,
      selectedNodeId: id,
    };
  });

  const { query } = useEditor();

  const hadSelectionRef = useRef(false);
  const prevNodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (hasSelection && selectedNodeId) {
      setMode("expanded");
      setHidden(false);

      if (prevNodeRef.current !== selectedNodeId) {
        prevNodeRef.current = selectedNodeId;
        try {
          const dom = query.node(selectedNodeId).get().dom as HTMLElement | undefined;
          if (dom) {
            const rect = dom.getBoundingClientRect();
            const panelW = width;
            const x = Math.min(rect.right + 12, window.innerWidth - panelW - 8);
            const y = Math.max(56, Math.min(rect.top, window.innerHeight - 400));
            setPos(clampPosition(x, y, panelW));
          }
        } catch {
          /* ignore */
        }
      }
    } else if (!hasSelection) {
      prevNodeRef.current = null;
    }
    hadSelectionRef.current = hasSelection;
  }, [hasSelection, selectedNodeId, query, width]);

  const panelWidth = mode === "collapsed" ? 44 : width;

  useEffect(() => {
    saveState({ mode, x: pos.x, y: pos.y, width });
  }, [mode, pos, width]);

  useEffect(() => {
    const onResize = () => {
      setPos((p) => clampPosition(p.x, p.y, panelWidth));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [panelWidth]);

  const onDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    },
    [pos]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const maxX = window.innerWidth - panelWidth - 8;
      const maxY = window.innerHeight - 80;
      setPos({
        x: Math.max(8, Math.min(maxX, dragRef.current.origX + dx)),
        y: Math.max(56, Math.min(maxY, dragRef.current.origY + dy)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [panelWidth]);

  const copyId = () => {
    if (elementId) void navigator.clipboard.writeText(elementId);
  };

  const updateElementId = (value: string) => {
    if (!selectedNodeId) return;
    actions.setProp(selectedNodeId, (p: Record<string, unknown>) => {
      p.elementId = value;
    });
  };

  if (!mounted) {
    return null;
  }

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className="fixed z-[400] flex items-center gap-1.5 rounded-full bg-indigo-600 text-white shadow-lg px-3 py-2 text-xs font-medium hover:bg-indigo-700 transition-colors"
        style={{ right: 24, top: "50%", transform: "translateY(-50%)" }}
        title="Mở bảng chỉnh sửa"
      >
        <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
        Chỉnh sửa
      </button>
    );
  }

  if (mode === "collapsed") {
    return (
      <div
        className="fixed z-[400] flex flex-col rounded-xl shadow-2xl border border-gray-200 overflow-hidden bg-white"
        style={{ left: pos.x, top: pos.y, width: 44 }}
      >
        <div
          className="flex flex-col items-center gap-0.5 py-2 px-1 bg-gradient-to-b from-indigo-600 to-indigo-700 text-white cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onDragStart}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHidden(true);
            }}
            className="p-1 rounded hover:bg-white/20"
            title="Ẩn"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <GripVertical className="w-3.5 h-3.5 opacity-90" strokeWidth={2} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMode("expanded");
            }}
            className="p-1 rounded hover:bg-white/20"
            title="Mở rộng"
          >
            <ChevronsLeft className="w-3.5 h-3.5 rotate-90" strokeWidth={2} />
          </button>
        </div>
        {hasSelection && (
          <div className="px-1 py-2 text-[10px] text-center text-gray-500 border-t border-gray-100 [writing-mode:vertical-rl] rotate-180 max-h-24 truncate">
            {selectedName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed z-[400] flex flex-col rounded-xl shadow-2xl border border-gray-200 overflow-hidden bg-white"
      style={{ left: pos.x, top: pos.y, width, maxHeight: "calc(100vh - 80px)" }}
    >
      <div
        className="flex items-center justify-between gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-100 cursor-grab active:cursor-grabbing select-none shrink-0"
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" strokeWidth={2} />
          <span className="text-[10px] text-gray-400 truncate">Kéo để di chuyển</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setMode("collapsed")}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
            title="Thu gọn"
          >
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="p-1 rounded hover:bg-gray-200 text-gray-500"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {hasSelection && (
        <div className="px-3 py-2 border-b border-gray-100 bg-white shrink-0">
          <p className="text-base font-semibold text-gray-800 truncate">{selectedName}</p>
          <div className="mt-1.5">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1 font-medium">Element ID</div>
            <div className="flex gap-1">
              <input
                type="text"
                value={elementId ?? ""}
                onChange={(e) => updateElementId(e.target.value)}
                placeholder="el_xxxx"
                className="flex-1 min-w-0 border border-gray-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={copyId}
                title="Sao chép ID"
                className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
        <PropertyPanel embedded key={selectedNodeId ?? "none"} />
      </div>
    </div>
  );
}