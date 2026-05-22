/** Published invitation width (fixed on /thiep). */
export const PUBLISHED_CANVAS_WIDTH = 390;

export const VIEWPORT_WIDTH_MIN = 320;
export const VIEWPORT_WIDTH_MAX = 520;
export const VIEWPORT_WIDTH_DEFAULT = PUBLISHED_CANVAS_WIDTH;

export const VIEWPORT_WIDTH_PRESETS = [375, 390, 414, 420, 430] as const;

export const VIEWPORT_WIDTH_STORAGE_KEY = "editor-viewport-width";

/** @deprecated Use EDITOR_AUTOSAVE_MS_DEFAULT from autosavePreferences */
export const EDITOR_AUTOSAVE_MS = 10_000;

export function clampViewportWidth(width: number): number {
  return Math.round(Math.min(VIEWPORT_WIDTH_MAX, Math.max(VIEWPORT_WIDTH_MIN, width)));
}

export function readStoredViewportWidth(): number {
  if (typeof window === "undefined") return VIEWPORT_WIDTH_DEFAULT;
  try {
    const raw = sessionStorage.getItem(VIEWPORT_WIDTH_STORAGE_KEY);
    if (!raw) return VIEWPORT_WIDTH_DEFAULT;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? clampViewportWidth(n) : VIEWPORT_WIDTH_DEFAULT;
  } catch {
    return VIEWPORT_WIDTH_DEFAULT;
  }
}
