"use client";

import React, { useEffect, useState } from "react";
import { useEditor, Element } from "@craftjs/core";
import { SectionBlock } from "../blocks/SectionBlock";
import { generateElementId } from "../utils/elementId";
import { safeDeleteNode } from "@/lib/editor/safeDeleteNode";

interface SectionIndicatorProps {
  containerRef: React.MutableRefObject<HTMLElement | null>;
}

interface IndicatorPos {
  top: number;
  height: number;
}

export function SectionIndicator({ containerRef }: SectionIndicatorProps) {
  const [position, setPosition] = useState<IndicatorPos | null>(null);

  const { selectedId, target, parentId, canMoveUp, canMoveDown, isHidden } = useEditor(
    (state, query) => {
      const selected = state.events.selected;
      const id = selected.size === 1 ? Array.from(selected)[0] : null;
      if (!id) return { selectedId: null, target: null as HTMLElement | null, parentId: null, canMoveUp: false, canMoveDown: false, isHidden: false };
      try {
        const node = query.node(id).get();
        const dom = node.dom as HTMLElement | undefined;
        const blockType = dom?.getAttribute("data-block") ?? "";
        if (blockType !== "section") return { selectedId: null, target: null, parentId: null, canMoveUp: false, canMoveDown: false, isHidden: false };

        const parent = node.data.parent;
        const siblings = parent ? query.node(parent).get().data.nodes ?? [] : [];
        const idx = siblings.indexOf(id);

        return {
          selectedId: id,
          target: dom ?? null,
          parentId: parent ?? null,
          canMoveUp: idx > 0,
          canMoveDown: idx < siblings.length - 1,
          isHidden: (node.data.props as Record<string, unknown>)?.hidden as boolean ?? false,
        };
      } catch {
        return { selectedId: null, target: null, parentId: null, canMoveUp: false, canMoveDown: false, isHidden: false };
      }
    }
  );

  const { actions, query } = useEditor();

  useEffect(() => {
    if (!selectedId || !target || !containerRef.current) {
      setPosition(null);
      return;
    }

    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setPosition({
        top: rect.top - containerRect.top + container.scrollTop,
        height: rect.height,
      });
    };

    update();
    const container = containerRef.current;
    container.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [selectedId, target, containerRef]);

  if (!selectedId || !position) return null;

  const scrollToSection = () => {
    target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleMoveUp = () => {
    if (!parentId || !canMoveUp) return;
    const siblings = query.node(parentId).get().data.nodes ?? [];
    const idx = siblings.indexOf(selectedId);
    if (idx > 0) {
      actions.move(selectedId, parentId, idx - 1);
      setTimeout(scrollToSection, 50);
    }
  };

  const handleMoveDown = () => {
    if (!parentId || !canMoveDown) return;
    const siblings = query.node(parentId).get().data.nodes ?? [];
    const idx = siblings.indexOf(selectedId);
    if (idx < siblings.length - 1) {
      actions.move(selectedId, parentId, idx + 2);
      setTimeout(scrollToSection, 50);
    }
  };

  const handleDuplicate = () => {
    if (!parentId) return;
    try {
      const nodeTree = query.node(selectedId).toNodeTree();
      const root = nodeTree.nodes[nodeTree.rootNodeId];
      const props = root?.data?.props as Record<string, unknown> | undefined;
      if (props && root?.data) {
        root.data.props = { ...props, elementId: generateElementId() };
      }
      const siblings = query.node(parentId).get().data.nodes ?? [];
      const idx = siblings.indexOf(selectedId);
      actions.addNodeTree(nodeTree, parentId, idx + 1);
    } catch { /* ignore */ }
  };

  const handleDelete = () => {
    safeDeleteNode(actions, query, selectedId);
  };

  const handleToggleHide = () => {
    actions.setProp(selectedId, (p: Record<string, unknown>) => { p.hidden = !isHidden; });
  };

  const handleAddBelow = () => {
    if (!parentId) return;
    const tree = query.parseReactElement(
      <Element is={SectionBlock} canvas height={400} bgType="color" bgColor="#f9f5f0" elementId={generateElementId()} />
    ).toNodeTree();
    const siblings = query.node(parentId).get().data.nodes ?? [];
    const idx = siblings.indexOf(selectedId);
    actions.addNodeTree(tree, parentId, idx + 1);
  };

  const midY = position.top + position.height / 2;

  const btnClass =
    "flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div
      className="absolute pointer-events-auto z-[150]"
      style={{ top: midY - 100, right: -44 }}
    >
      <div className="flex flex-col gap-0.5 bg-white border border-gray-200 rounded-xl shadow-lg p-1">
        <button className={btnClass} onClick={handleMoveUp} disabled={!canMoveUp} title="Đưa lên trên">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button className={btnClass} onClick={handleMoveDown} disabled={!canMoveDown} title="Đưa xuống dưới">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="h-px bg-gray-100 my-0.5" />
        <button className={btnClass} onClick={handleDuplicate} title="Nhân bản section">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          className={`${btnClass} ${isHidden ? "text-indigo-500" : ""}`}
          onClick={handleToggleHide}
          title={isHidden ? "Hiện section" : "Ẩn section"}
        >
          {isHidden ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
        <div className="h-px bg-gray-100 my-0.5" />
        <button className={`${btnClass} text-red-400 hover:text-red-600 hover:bg-red-50`} onClick={handleDelete} title="Xóa section">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <div className="h-px bg-gray-100 my-0.5" />
        <button className={`${btnClass} text-green-500 hover:text-green-700 hover:bg-green-50`} onClick={handleAddBelow} title="Thêm section bên dưới">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
