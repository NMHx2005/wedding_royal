"use client";

import React, { createContext, useContext, useRef } from "react";

interface EditorCanvasContextValue {
  zoom: number;
  /** Craft layout width (max 390px), centered inside the phone frame */
  contentWidth: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** True while user is dragging a block on the phone canvas (suppress stray clicks). */
  isDraggingBlockRef: React.MutableRefObject<boolean>;
  /** Skip the next canvas click after a drag gesture. */
  suppressClickAfterDragRef: React.MutableRefObject<boolean>;
}

const EditorCanvasContext = createContext<EditorCanvasContextValue>({
  zoom: 1,
  contentWidth: 390,
  scrollContainerRef: { current: null },
  isDraggingBlockRef: { current: false },
  suppressClickAfterDragRef: { current: false },
});

export function EditorCanvasProvider({
  zoom,
  contentWidth,
  scrollContainerRef,
  children,
}: {
  zoom: number;
  contentWidth: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const isDraggingBlockRef = useRef(false);
  const suppressClickAfterDragRef = useRef(false);

  return (
    <EditorCanvasContext.Provider
      value={{ zoom, contentWidth, scrollContainerRef, isDraggingBlockRef, suppressClickAfterDragRef }}
    >
      {children}
    </EditorCanvasContext.Provider>
  );
}

export function useEditorCanvas() {
  return useContext(EditorCanvasContext);
}
