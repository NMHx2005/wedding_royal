"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";
import Moveable from "react-moveable";
import { readBlockPositionFromDom } from "@/lib/editor/flushBlockPositionsFromDom";
import { useEditorCanvas } from "./EditorCanvasContext";

type BlockType =
  | "text"
  | "image"
  | "icon"
  | "button"
  | "countdown"
  | "divider"
  | "giftbox"
  | "section"
  | string;

function parseBlockType(el: HTMLElement | null): BlockType {
  return el?.getAttribute("data-block") ?? "";
}

function dimensionUpdates(
  blockType: BlockType,
  w: number,
  h: number
): Record<string, number> {
  switch (blockType) {
    case "icon":
      return { size: Math.round(Math.max(w, h, 16)) };
    case "text":
    case "button":
    case "countdown":
      return { width: Math.round(Math.max(w, 40)) };
    default:
      return {
        width: Math.round(Math.max(w, 20)),
        height: Math.round(Math.max(h, 20)),
      };
  }
}

interface EditorMoveableProps {
  rootContainer?: HTMLElement | null;
}

export function EditorMoveable({ rootContainer }: EditorMoveableProps) {
  const { zoom, isDraggingBlockRef, suppressClickAfterDragRef } = useEditorCanvas();
  const dragPosRef = useRef<{ left: number; top: number } | null>(null);
  const sizeRef = useRef<Record<string, number> | null>(null);
  const dragMovedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ left: number; top: number } | null>(null);

  const { selectedId, target, blockType, locked, lockAspect, actions } =
    useEditor((state, q) => {
      const selected = state.events.selected;
      const id = selected.size === 1 ? Array.from(selected)[0] : null;
      if (!id) {
        return {
          selectedId: null as string | null,
          target: null as HTMLElement | null,
          blockType: "",
          locked: false,
          lockAspect: true,
        };
      }
      try {
        const node = q.node(id).get();
        const dom = node.dom as HTMLElement | undefined;
        const props = node.data.props as Record<string, unknown>;
        const type = parseBlockType(dom ?? null);
        if (type === "section") {
          return {
            selectedId: null,
            target: null,
            blockType: type,
            locked: false,
            lockAspect: true,
          };
        }
        return {
          selectedId: id,
          target: dom ?? null,
          blockType: type,
          locked: !!props.locked,
          lockAspect: props.lockAspect !== false,
        };
      } catch {
        return {
          selectedId: null,
          target: null,
          blockType: "",
          locked: false,
          lockAspect: true,
        };
      }
    });

  const applyPositionToCraft = useCallback(
    (left: number, top: number) => {
      if (!selectedId) return;
      actions.setProp(selectedId, (props: Record<string, unknown>) => {
        props.left = left;
        props.top = top;
      });
    },
    [selectedId, actions]
  );

  const schedulePositionUpdate = useCallback(
    (left: number, top: number) => {
      pendingPosRef.current = { left, top };
      dragPosRef.current = { left, top };
      applyPositionToCraft(left, top);
    },
    [applyPositionToCraft]
  );

  const flushProps = useCallback(() => {
    if (!selectedId) return;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pendingPosRef.current) {
      dragPosRef.current = pendingPosRef.current;
      pendingPosRef.current = null;
    }
    const updates: Record<string, number> = {
      ...(dragPosRef.current ?? {}),
      ...(sizeRef.current ?? {}),
    };
    if (Object.keys(updates).length === 0 && target) {
      const pos = readBlockPositionFromDom(target);
      if (pos) Object.assign(updates, pos);
    }
    dragPosRef.current = null;
    sizeRef.current = null;
    if (Object.keys(updates).length === 0) return;
    actions.setProp(selectedId, (props: Record<string, unknown>) => {
      Object.assign(props, updates);
    });
  }, [selectedId, target, actions]);

  useEffect(() => {
    const onFlush = () => flushProps();
    window.addEventListener("royal-editor:flush-moveable", onFlush);
    return () => window.removeEventListener("royal-editor:flush-moveable", onFlush);
  }, [flushProps]);

  useEffect(() => {
    const id = selectedId;
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const p = pendingPosRef.current ?? dragPosRef.current;
      if (id && p) {
        actions.setProp(id, (props: Record<string, unknown>) => {
          props.left = p.left;
          props.top = p.top;
        });
      }
      dragPosRef.current = null;
      sizeRef.current = null;
      pendingPosRef.current = null;
      dragMovedRef.current = false;
    };
  }, [selectedId, actions]);

  if (!selectedId || !target || locked || !blockType) return null;

  const keepRatio = blockType === "icon" && lockAspect;
  const widthOnly = ["text", "button", "countdown"].includes(blockType);

  const siblingGuides = rootContainer
    ? (Array.from(
        rootContainer.querySelectorAll("[data-block]:not([data-block='section'])")
      ).filter((el) => el !== target) as HTMLElement[])
    : [];

  return (
    <Moveable
      key={selectedId}
      target={target}
      rootContainer={rootContainer ?? undefined}
      zoom={zoom}
      draggable
      resizable
      renderDirections={widthOnly ? ["e", "w"] : undefined}
      rotatable
      keepRatio={keepRatio}
      throttleDrag={0}
      throttleResize={1}
      origin={false}
      snappable
      snapThreshold={8}
      snapGridWidth={10}
      snapGridHeight={10}
      snapCenter
      elementGuidelines={siblingGuides}
      onDragStart={() => {
        isDraggingBlockRef.current = true;
        dragMovedRef.current = false;
      }}
      onDrag={({ target: el, left, top, dist }) => {
        const node = el as HTMLElement;
        const l = Math.round(left);
        const t = Math.round(top);
        node.style.left = `${l}px`;
        node.style.top = `${t}px`;
        if (Math.abs(dist[0]) > 2 || Math.abs(dist[1]) > 2) {
          dragMovedRef.current = true;
        }
        schedulePositionUpdate(l, t);
      }}
      onDragEnd={({ target: el, lastEvent }) => {
        isDraggingBlockRef.current = false;
        if (dragMovedRef.current) {
          suppressClickAfterDragRef.current = true;
          requestAnimationFrame(() => {
            suppressClickAfterDragRef.current = false;
          });
        }
        const node = el as HTMLElement;
        const pos = readBlockPositionFromDom(node, lastEvent);
        if (!pos) return;
        node.style.left = `${pos.left}px`;
        node.style.top = `${pos.top}px`;
        dragPosRef.current = pos;
        flushProps();
      }}
      onResize={({ target: el, width, height, drag }) => {
        const node = el as HTMLElement;
        node.style.width = `${width}px`;
        if (!widthOnly) node.style.height = `${height}px`;
        node.style.left = `${drag.left}px`;
        node.style.top = `${drag.top}px`;
        schedulePositionUpdate(Math.round(drag.left), Math.round(drag.top));
      }}
      onResizeEnd={({ target: el, lastEvent }) => {
        const node = el as HTMLElement;
        const drag = lastEvent?.drag as { left?: number; top?: number } | undefined;
        const pos = readBlockPositionFromDom(node, drag);
        if (!pos) return;
        node.style.left = `${pos.left}px`;
        node.style.top = `${pos.top}px`;
        dragPosRef.current = pos;
        sizeRef.current = dimensionUpdates(
          blockType,
          node.offsetWidth,
          node.offsetHeight
        );
        flushProps();
      }}
      onRotate={({ target: el, rotate }) => {
        (el as HTMLElement).style.transform = `rotate(${rotate}deg)`;
      }}
      onRotateEnd={({ target: el, lastEvent }) => {
        (el as HTMLElement).style.transform = "";
        sizeRef.current = { rotateZ: Math.round(lastEvent?.rotate ?? 0) };
        flushProps();
      }}
    />
  );
}
