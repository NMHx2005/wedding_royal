"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useEditor } from "@craftjs/core";
import { SaveTemplateModal } from "./panels/SaveTemplateModal";
import {
  VIEWPORT_WIDTH_DEFAULT,
  VIEWPORT_WIDTH_STORAGE_KEY,
  clampViewportWidth,
  readStoredViewportWidth,
} from "@/lib/editor/canvasViewport";

interface EditorUIContextValue {
  openSaveTemplate: () => void;
  viewportWidth: number;
  setViewportWidth: (width: number) => void;
}

const EditorUIContext = createContext<EditorUIContextValue>({
  openSaveTemplate: () => {},
  viewportWidth: VIEWPORT_WIDTH_DEFAULT,
  setViewportWidth: () => {},
});

export function EditorUIProvider({ children }: { children: React.ReactNode }) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [viewportWidth, setViewportWidthState] = useState(VIEWPORT_WIDTH_DEFAULT);
  const { query } = useEditor();

  useEffect(() => {
    setViewportWidthState(readStoredViewportWidth());
  }, []);

  const setViewportWidth = useCallback((width: number) => {
    const next = clampViewportWidth(width);
    setViewportWidthState(next);
    try {
      sessionStorage.setItem(VIEWPORT_WIDTH_STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  const openSaveTemplate = useCallback(() => setSaveOpen(true), []);

  const getContentJson = () => {
    try {
      return JSON.parse(query.serialize()) as Record<string, unknown>;
    } catch {
      return {};
    }
  };

  return (
    <EditorUIContext.Provider value={{ openSaveTemplate, viewportWidth, setViewportWidth }}>
      {children}
      {saveOpen && (
        <SaveTemplateModal
          contentJson={getContentJson()}
          onClose={() => setSaveOpen(false)}
          onSaved={() => setSaveOpen(false)}
        />
      )}
    </EditorUIContext.Provider>
  );
}

export function useEditorUI() {
  return useContext(EditorUIContext);
}
