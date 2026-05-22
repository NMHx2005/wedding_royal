"use client";

import React, { useCallback, useState } from "react";
import { useEditor } from "@craftjs/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Layers,
} from "lucide-react";
import {
  buildLayerTree,
  type LayerTreeSection,
} from "@/lib/editor/layerTree";
import { reorderParentChildren } from "@/lib/editor/layerReorder";

function MoveButtons({
  onUp,
  onDown,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex flex-col shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        type="button"
        disabled={disableUp}
        onClick={(e) => {
          e.stopPropagation();
          onUp();
        }}
        className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-25"
        title="Lên"
      >
        <ChevronUp className="h-3 w-3" />
      </button>
      <button
        type="button"
        disabled={disableDown}
        onClick={(e) => {
          e.stopPropagation();
          onDown();
        }}
        className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-25"
        title="Xuống"
      >
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );
}

function LayerRow({
  label,
  depth,
  isSection,
  selected,
  onSelect,
  childCount,
  collapsed,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
}: {
  label: string;
  depth: number;
  isSection: boolean;
  selected: boolean;
  onSelect: () => void;
  childCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
}) {
  return (
    <div
      style={{ paddingLeft: 8 + depth * 14 }}
      className={`group flex items-center gap-0.5 rounded-md pr-1 ${
        selected ? "bg-indigo-100" : "hover:bg-gray-100"
      }`}
    >
      {isSection && onToggleCollapse ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0"
          aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <span className="w-4 shrink-0" />
      )}

      <button
        type="button"
        onClick={onSelect}
        className={`flex-1 min-w-0 text-left py-1.5 pr-1 truncate text-sm transition-colors ${
          selected
            ? "text-indigo-700 font-medium"
            : isSection
              ? "text-gray-800 font-semibold"
              : "text-gray-600"
        }`}
      >
        {label}
        {isSection && childCount !== undefined && childCount > 0 && (
          <span className="ml-1 font-normal text-gray-400">({childCount})</span>
        )}
      </button>

      <MoveButtons
        onUp={onMoveUp}
        onDown={onMoveDown}
        disableUp={disableMoveUp}
        disableDown={disableMoveDown}
      />
    </div>
  );
}

function SectionBlockList({
  section,
  sectionIndex,
  sectionCount,
  selectedId,
  collapsed,
  onToggleCollapse,
  onSelect,
  onReorderSection,
  onReorderBlock,
}: {
  section: LayerTreeSection;
  sectionIndex: number;
  sectionCount: number;
  selectedId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (id: string) => void;
  onReorderSection: (from: number, to: number) => void;
  onReorderBlock: (sectionId: string, from: number, to: number) => void;
}) {
  return (
    <div className="mb-0.5">
      <LayerRow
        label={section.name}
        depth={0}
        isSection
        selected={selectedId === section.id}
        onSelect={() => onSelect(section.id)}
        childCount={section.children.length}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        onMoveUp={() => onReorderSection(sectionIndex, sectionIndex - 1)}
        onMoveDown={() => onReorderSection(sectionIndex, sectionIndex + 1)}
        disableMoveUp={sectionIndex === 0}
        disableMoveDown={sectionIndex >= sectionCount - 1}
      />

      {!collapsed &&
        section.children.map((child, childIndex) => (
          <LayerRow
            key={child.id}
            label={child.name}
            depth={1}
            isSection={false}
            selected={selectedId === child.id}
            onSelect={() => onSelect(child.id)}
            onMoveUp={() => onReorderBlock(section.id, childIndex, childIndex - 1)}
            onMoveDown={() => onReorderBlock(section.id, childIndex, childIndex + 1)}
            disableMoveUp={childIndex === 0}
            disableMoveDown={childIndex >= section.children.length - 1}
          />
        ))}

      {!collapsed && section.children.length === 0 && (
        <p className="text-xs text-gray-400 py-1" style={{ paddingLeft: 8 + 14 }}>
          Chưa có thành phần
        </p>
      )}
    </div>
  );
}

export function LayerPanel() {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set()
  );

  const { tree, selectedId, actions, query } = useEditor((state, q) => {
    const nodeIds = Object.keys(state.nodes);
    const structureKey = nodeIds
      .map((id) => {
        const n = state.nodes[id]?.data;
        if (!n) return "";
        const nodes = (n.nodes ?? []).join(",");
        const linked = Object.values(n.linkedNodes ?? {}).join(",");
        return `${id}:${nodes}|${linked}`;
      })
      .join(";");
    void structureKey;

    const built = buildLayerTree(q, nodeIds);
    const selected =
      state.events.selected.size > 0
        ? Array.from(state.events.selected)[0]
        : null;
    return { tree: built, selectedId: selected, query: q };
  });

  const sectionIds = tree.sections.map((s) => s.id);

  const applySectionOrder = useCallback(
    (from: number, to: number) => {
      const parentId = tree.sectionsParentId ?? tree.canvasParentId;
      if (!parentId || from === to || from < 0 || to < 0) return;
      if (from >= sectionIds.length || to >= sectionIds.length) return;
      const newOrder = arrayMove(sectionIds, from, to);
      reorderParentChildren(actions, query, parentId, newOrder);
    },
    [actions, query, sectionIds, tree.sectionsParentId, tree.canvasParentId]
  );

  const applyBlockOrder = useCallback(
    (sectionId: string, from: number, to: number) => {
      const section = tree.sections.find((s) => s.id === sectionId);
      if (!section || from === to || from < 0 || to < 0) return;
      const ids = section.children.map((c) => c.id);
      if (from >= ids.length || to >= ids.length) return;
      const newOrder = arrayMove(ids, from, to);
      reorderParentChildren(actions, query, sectionId, newOrder);
    },
    [actions, query, tree.sections]
  );

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  if (tree.sections.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4 px-3">
        Chưa có section. Thêm Section từ thư viện phần tử.
      </p>
    );
  }

  return (
    <div className="p-2 h-full overflow-y-auto">
      <div className="flex items-center gap-1.5 px-1 mb-2 text-xs text-gray-500 uppercase tracking-wide">
        <Layers className="h-3.5 w-3.5" />
        <span>Danh sách phần tử</span>
      </div>
      <p className="text-xs text-gray-400 px-1 mb-2">
        Bấm để chọn · dùng ↑↓ đổi thứ tự. Kéo trực tiếp trên khung thiệp để di chuyển.
      </p>

      {tree.sections.map((section, index) => (
        <SectionBlockList
          key={section.id}
          section={section}
          sectionIndex={index}
          sectionCount={tree.sections.length}
          selectedId={selectedId}
          collapsed={collapsedSections.has(section.id)}
          onToggleCollapse={() => toggleSection(section.id)}
          onSelect={(id) => actions.selectNode(id)}
          onReorderSection={applySectionOrder}
          onReorderBlock={applyBlockOrder}
        />
      ))}
    </div>
  );
}
