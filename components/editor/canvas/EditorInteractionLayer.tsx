"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";
import { useEditorCanvas } from "./EditorCanvasContext";

const HOVER_CLASS = "editor-block-hover";

interface EditorInteractionLayerProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

function findBlockTarget(el: EventTarget | null): HTMLElement | null {
  if (!(el instanceof HTMLElement)) return null;
  const block = el.closest("[data-block][data-node-id]") as HTMLElement | null;
  return block;
}

export function EditorInteractionLayer({ containerRef }: EditorInteractionLayerProps) {
  const hoveredRef = useRef<HTMLElement | null>(null);
  const { actions, query } = useEditor();
  const { isDraggingBlockRef, suppressClickAfterDragRef } = useEditorCanvas();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clearHover = () => {
      if (hoveredRef.current) {
        hoveredRef.current.classList.remove(HOVER_CLASS);
        hoveredRef.current = null;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const block = findBlockTarget(e.target);
      if (!block || block === hoveredRef.current) return;
      clearHover();
      hoveredRef.current = block;
      block.classList.add(HOVER_CLASS);
    };

    const onMouseOut = (e: MouseEvent) => {
      const block = findBlockTarget(e.target);
      if (!block || block !== hoveredRef.current) return;
      const related = e.relatedTarget;
      if (related instanceof Node && block.contains(related)) return;
      clearHover();
    };

    const onClick = (e: MouseEvent) => {
      if (isDraggingBlockRef.current || suppressClickAfterDragRef.current) return;
      const block = findBlockTarget(e.target);
      if (!block) return;
      const nodeId = block.getAttribute("data-node-id");
      if (!nodeId) return;

      // Ignore clicks on moveable controls / resize handles
      if ((e.target as HTMLElement).closest(".moveable-control, .moveable-line")) return;

      try {
        query.node(nodeId).get();
        actions.selectNode(nodeId);
        e.stopPropagation();
      } catch {
        /* node not found */
      }
    };

    container.addEventListener("mouseover", onMouseOver, true);
    container.addEventListener("mouseout", onMouseOut, true);
    container.addEventListener("click", onClick, true);

    return () => {
      container.removeEventListener("mouseover", onMouseOver, true);
      container.removeEventListener("mouseout", onMouseOut, true);
      container.removeEventListener("click", onClick, true);
      clearHover();
    };
  }, [containerRef, actions, query, isDraggingBlockRef, suppressClickAfterDragRef]);

  return null;
}
