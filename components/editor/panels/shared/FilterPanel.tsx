"use client";

import React from "react";

type SetPropFn = (fn: (p: Record<string, unknown>) => void) => void;

const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
  "exclusion", "hue", "saturation", "color", "luminosity",
];

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-1">
      <div className="flex justify-between mb-0.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs text-gray-400 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 accent-indigo-500"
      />
    </div>
  );
}

interface FilterPanelProps {
  props: Record<string, unknown>;
  setProp: SetPropFn;
}

export function FilterPanel({ props, setProp }: FilterPanelProps) {
  return (
    <div className="space-y-1">
      <div className="py-1">
        <span className="text-xs text-gray-500">Chế độ hoà trộn</span>
        <select
          value={(props.blendMode as string) ?? "normal"}
          onChange={(e) => setProp((p) => { p.blendMode = e.target.value; })}
          className="w-full mt-1 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
        >
          {BLEND_MODES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <SliderRow label="Độ tương phản" value={(props.filterContrast as number) ?? 100} min={0} max={200} onChange={(v) => setProp((p) => { p.filterContrast = v; })} />
      <SliderRow label="Độ sáng" value={(props.filterBrightness as number) ?? 100} min={0} max={200} onChange={(v) => setProp((p) => { p.filterBrightness = v; })} />
      <SliderRow label="Độ bão hoà" value={(props.filterSaturate as number) ?? 100} min={0} max={200} onChange={(v) => setProp((p) => { p.filterSaturate = v; })} />
      <SliderRow label="Xám hoá" value={(props.filterGrayscale as number) ?? 0} min={0} max={100} onChange={(v) => setProp((p) => { p.filterGrayscale = v; })} />
      <SliderRow label="Độ mờ (filter)" value={(props.filterOpacity as number) ?? 100} min={0} max={100} onChange={(v) => setProp((p) => { p.filterOpacity = v; })} />
      <SliderRow label="Đảo màu" value={(props.filterInvert as number) ?? 0} min={0} max={100} onChange={(v) => setProp((p) => { p.filterInvert = v; })} />
      <SliderRow label="Tông ấm (Sepia)" value={(props.filterSepia as number) ?? 0} min={0} max={100} onChange={(v) => setProp((p) => { p.filterSepia = v; })} />
      <SliderRow label="Xoay màu (°)" value={(props.filterHueRotate as number) ?? 0} min={0} max={360} onChange={(v) => setProp((p) => { p.filterHueRotate = v; })} />
      <button
        onClick={() => setProp((p) => {
          p.blendMode = "normal";
          p.filterContrast = 100;
          p.filterBrightness = 100;
          p.filterSaturate = 100;
          p.filterGrayscale = 0;
          p.filterOpacity = 100;
          p.filterInvert = 0;
          p.filterSepia = 0;
          p.filterHueRotate = 0;
        })}
        className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 rounded border border-gray-100 hover:bg-gray-50 mt-1"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
}
