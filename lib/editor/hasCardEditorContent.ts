import { canOpenVisualEditor } from "@/lib/editor/contentJsonKind";

/** True when the card has Craft.js content and can open the visual editor. */
export function hasCardEditorContent(content: unknown): boolean {
  return canOpenVisualEditor(content);
}
