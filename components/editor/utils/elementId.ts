/** Short unique DOM id for events (navigate-section, toggle-element). */
export function generateElementId(): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `el_${suffix}`;
}
