export const EDITOR_AUTOSAVE_ENABLED_KEY = "editor-autosave-enabled";
export const EDITOR_AUTOSAVE_MS_KEY = "editor-autosave-ms";

/** Default interval when user turns autosave on. */
export const EDITOR_AUTOSAVE_MS_DEFAULT = 10_000;

export const EDITOR_AUTOSAVE_MS_MIN = 5_000;
export const EDITOR_AUTOSAVE_MS_MAX = 300_000;

export const EDITOR_AUTOSAVE_INTERVAL_PRESETS_SEC = [5, 10, 30, 60, 120] as const;

export function clampAutosaveMs(ms: number): number {
  return Math.round(
    Math.min(EDITOR_AUTOSAVE_MS_MAX, Math.max(EDITOR_AUTOSAVE_MS_MIN, ms))
  );
}

export function readStoredAutosaveEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(EDITOR_AUTOSAVE_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeStoredAutosaveEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(EDITOR_AUTOSAVE_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
    /* ignore */
  }
}

export function readStoredAutosaveMs(): number {
  if (typeof window === "undefined") return EDITOR_AUTOSAVE_MS_DEFAULT;
  try {
    const raw = localStorage.getItem(EDITOR_AUTOSAVE_MS_KEY);
    if (!raw) return EDITOR_AUTOSAVE_MS_DEFAULT;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? clampAutosaveMs(n) : EDITOR_AUTOSAVE_MS_DEFAULT;
  } catch {
    return EDITOR_AUTOSAVE_MS_DEFAULT;
  }
}

export function writeStoredAutosaveMs(ms: number): void {
  try {
    localStorage.setItem(EDITOR_AUTOSAVE_MS_KEY, String(clampAutosaveMs(ms)));
  } catch {
    /* ignore */
  }
}

export function formatAutosaveInterval(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  return `${min} phút`;
}
