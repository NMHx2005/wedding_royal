import { useEditorUI } from "@/components/editor/EditorUIContext";

/** Current editor preview frame width (px). Published /thiep stays 390. */
export function useEditorViewportWidth(): number {
  return useEditorUI().viewportWidth;
}
