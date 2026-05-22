"use client";

import React from "react";

type SetPropFn = (fn: (p: Record<string, unknown>) => void) => void;

const ORIGINS = [
  { value: "center center", label: "Trung tâm" },
  { value: "top left", label: "Góc trên trái" },
  { value: "top center", label: "Trên giữa" },
  { value: "top right", label: "Góc trên phải" },
  { value: "center left", label: "Giữa trái" },
  { value: "center right", label: "Giữa phải" },
  { value: "bottom left", label: "Góc dưới trái" },
  { value: "bottom center", label: "Dưới giữa" },
  { value: "bottom right", label: "Góc dưới phải" },
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
        <span className="text-xs text-gray-400 font-mono">{value}°</span>
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

interface TransformPanelProps {
  props: Record<string, unknown>;
  setProp: SetPropFn;
}

export function TransformPanel({ props, setProp }: TransformPanelProps) {
  return (
    <div className="space-y-1">
      <div className="py-1">
        <span className="text-xs text-gray-500">Điểm gốc</span>
        <select
          value={(props.transformOrigin as string) ?? "center center"}
          onChange={(e) => setProp((p) => { p.transformOrigin = e.target.value; })}
          className="w-full mt-1 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
        >
          {ORIGINS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <SliderRow label="Xoay X" value={(props.rotateX as number) ?? 0} min={-180} max={180} onChange={(v) => setProp((p) => { p.rotateX = v; })} />
      <SliderRow label="Xoay Y" value={(props.rotateY as number) ?? 0} min={-180} max={180} onChange={(v) => setProp((p) => { p.rotateY = v; })} />
      <SliderRow label="Xoay Z" value={(props.rotateZ as number) ?? 0} min={-180} max={180} onChange={(v) => setProp((p) => { p.rotateZ = v; })} />
      <SliderRow label="Nghiêng X" value={(props.skewX as number) ?? 0} min={-89} max={89} onChange={(v) => setProp((p) => { p.skewX = v; })} />
      <SliderRow label="Nghiêng Y" value={(props.skewY as number) ?? 0} min={-89} max={89} onChange={(v) => setProp((p) => { p.skewY = v; })} />
      <div className="py-1">
        <div className="flex justify-between mb-0.5">
          <span className="text-xs text-gray-500">Phối cảnh (px)</span>
          <span className="text-xs text-gray-400 font-mono">{(props.perspective as number) ?? 0}</span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          value={(props.perspective as number) ?? 0}
          onChange={(e) => setProp((p) => { p.perspective = Number(e.target.value); })}
          className="w-full h-1 accent-indigo-500"
        />
      </div>
      <button
        onClick={() => setProp((p) => {
          p.transformOrigin = "center center";
          p.rotateX = 0;
          p.rotateY = 0;
          p.rotateZ = 0;
          p.skewX = 0;
          p.skewY = 0;
          p.perspective = 0;
        })}
        className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 rounded border border-gray-100 hover:bg-gray-50 mt-1"
      >
        Đặt lại biến đổi
      </button>
    </div>
  );
}
