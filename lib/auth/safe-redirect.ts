/** Only allow same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(next: string | null | undefined, fallback = "/dashboard"): string {
  const raw = (next ?? fallback).trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  if (raw.includes("\\") || raw.includes("\0")) {
    return fallback;
  }
  try {
    const parsed = new URL(raw, "http://local.invalid");
    if (parsed.origin !== "http://local.invalid") {
      return fallback;
    }
  } catch {
    return fallback;
  }
  return raw;
}
