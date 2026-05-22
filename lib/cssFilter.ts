/**
 * Shared CSS filter builder used by:
 * - SectionBlock (background layer filter)
 * - ImageBlock (per-image filter)
 * - CraftJsViewer (public render)
 */

export interface FilterProps {
  filterContrast?: number;
  filterBrightness?: number;
  filterSaturate?: number;
  filterGrayscale?: number;
  filterOpacity?: number;
  filterInvert?: number;
  filterSepia?: number;
  filterHueRotate?: number;
}

export const FILTER_DEFAULTS: Required<FilterProps> = {
  filterContrast: 100,
  filterBrightness: 100,
  filterSaturate: 100,
  filterGrayscale: 0,
  filterOpacity: 100,
  filterInvert: 0,
  filterSepia: 0,
  filterHueRotate: 0,
};

/**
 * Builds a CSS `filter` string from FilterProps.
 * Returns undefined when all values are at defaults (no-op).
 */
export function buildFilterString(props: FilterProps): string | undefined {
  const parts: string[] = [];
  const d = FILTER_DEFAULTS;

  if ((props.filterContrast ?? d.filterContrast) !== d.filterContrast)
    parts.push(`contrast(${props.filterContrast}%)`);
  if ((props.filterBrightness ?? d.filterBrightness) !== d.filterBrightness)
    parts.push(`brightness(${props.filterBrightness}%)`);
  if ((props.filterSaturate ?? d.filterSaturate) !== d.filterSaturate)
    parts.push(`saturate(${props.filterSaturate}%)`);
  if ((props.filterGrayscale ?? d.filterGrayscale) !== d.filterGrayscale)
    parts.push(`grayscale(${props.filterGrayscale}%)`);
  if ((props.filterOpacity ?? d.filterOpacity) !== d.filterOpacity)
    parts.push(`opacity(${props.filterOpacity}%)`);
  if ((props.filterInvert ?? d.filterInvert) !== d.filterInvert)
    parts.push(`invert(${props.filterInvert}%)`);
  if ((props.filterSepia ?? d.filterSepia) !== d.filterSepia)
    parts.push(`sepia(${props.filterSepia}%)`);
  if ((props.filterHueRotate ?? d.filterHueRotate) !== d.filterHueRotate)
    parts.push(`hue-rotate(${props.filterHueRotate}deg)`);

  return parts.length > 0 ? parts.join(" ") : undefined;
}
