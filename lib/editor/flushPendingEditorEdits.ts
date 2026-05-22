/** Blur in-canvas contentEditable so Craft `serialize()` includes the latest text. */
export function flushPendingEditorEdits(): void {
  window.dispatchEvent(new Event("royal-editor:flush-moveable"));
  const el = document.activeElement;
  if (el instanceof HTMLElement && el.isContentEditable) {
    el.blur();
  }
}
