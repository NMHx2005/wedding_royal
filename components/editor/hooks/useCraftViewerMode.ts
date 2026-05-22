import { useEditor } from "@craftjs/core";

/** True when Craft is in read-only mode (public invitation / preview). */
export function useCraftViewerMode() {
  const enabled = useEditor((state) => state.options.enabled);
  return !enabled;
}
