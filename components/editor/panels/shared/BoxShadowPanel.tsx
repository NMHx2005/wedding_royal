"use client";

import React from "react";

type SetPropFn = (fn: (p: Record<string, unknown>) => void) => void;

const SHADOW_PRESETS = [
  { label: "Soft Drop", x: 0, y: 4, blur: 16, opacity: 20, color: "#000000" },
  { label: "Subtle", x: 0, y: 2, blur: 8, opacity: 15, color: "#000000" },
  { label: "Strong", x: 0, y: 8, blur: 24, opacity: 35, color: "#000000" },
  { label: "Colored", x: 0, y: 4, blur: 16, opacity: 40, color: "#ea6c88" },
];

interface BoxShadowPanelProps {
  props: Record<string, unknown>;
  setProp: SetPropFn;
}

export function BoxShadowPanel({ props, setProp }: BoxShadowPanelProps) {
  const shadowType = (props.shadowType as string) ?? "none";

  return (
    <div className="space-y-2">
      <div>
        <span className="text-xs text-gray-500">Loại bóng</span>
        <div className="flex gap-1 mt-1">
          {["none", "outer", "inner"].map((t) => (
            <button
              key={t}
              onClick={() => setProp((p) => { p.shadowType = t; })}
              className={`flex-1 text-xs py-1 rounded border transition-colors ${
                shadowType === t
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t === "none" ? "Không" : t === "outer" ? "Ngoài" : "Trong"}
            </button>
          ))}
        </div>
      </div>

      {shadowType !== "none" && (
        <>
          <div className="flex gap-1 flex-wrap">
            {SHADOW_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  setProp((p) => {
                    p.shadowX = preset.x;
                    p.shadowY = preset.y;
                    p.shadowBlur = preset.blur;
                    p.shadowOpacity = preset.opacity;
                    p.shadowColor = preset.color;
                  })
                }
                className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {[
            { label: "Dịch X", key: "shadowX", min: -50, max: 50 },
            { label: "Dịch Y", key: "shadowY", min: -50, max: 50 },
            { label: "Mờ", key: "shadowBlur", min: 0, max: 60 },
            { label: "Độ đậm", key: "shadowOpacity", min: 0, max: 100 },
          ].map(({ label, key, min, max }) => (
            <div key={key} className="py-1">
              <div className="flex justify-between mb-0.5">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs text-gray-400 font-mono">{(props[key] as number) ?? 0}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={(props[key] as number) ?? 0}
                onChange={(e) => setProp((p) => { p[key] = Number(e.target.value); })}
                className="w-full h-1 accent-indigo-500"
              />
            </div>
          ))}

          <div className="py-1">
            <span className="text-xs text-gray-500">Màu bóng</span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                value={(props.shadowColor as string) ?? "#000000"}
                onChange={(e) => setProp((p) => { p.shadowColor = e.target.value; })}
                className="w-8 h-7 border border-gray-200 rounded cursor-pointer p-0"
              />
              <input
                type="text"
                value={(props.shadowColor as string) ?? "#000000"}
                onChange={(e) => setProp((p) => { p.shadowColor = e.target.value; })}
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
