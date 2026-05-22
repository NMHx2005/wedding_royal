"use client";

import { useEditor } from "@craftjs/core";
import { useEffect } from "react";
import { flushBlockPositionsFromDom } from "@/lib/editor/flushBlockPositionsFromDom";

/** Always mounted — flushes block positions even when nothing is selected. */
export function EditorPositionFlushBridge({
  rootContainer,
}: {
  rootContainer?: HTMLElement | null;
}) {
  const { actions, query } = useEditor();

  useEffect(() => {
    const onFlush = () => {
      flushBlockPositionsFromDom(rootContainer, query, actions);
    };
    window.addEventListener("royal-editor:flush-moveable", onFlush);
    return () => window.removeEventListener("royal-editor:flush-moveable", onFlush);
  }, [rootContainer, query, actions]);

  return null;
}
