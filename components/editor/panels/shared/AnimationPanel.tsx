"use client";

import React, { useRef } from "react";
import { ANIMATION_GROUPS } from "@/lib/editor/animation-options";

type SetPropFn = (fn: (p: Record<string, unknown>) => void) => void;

interface AnimationPanelProps {
  props: Record<string, unknown>;
  setProp: SetPropFn;
  nodeId?: string;
}

export function AnimationPanel({ props, setProp, nodeId }: AnimationPanelProps) {
  const animationEntry = (props.animationEntry as string) ?? "";
  const animationDuration = (props.animationDuration as number) ?? 1;
  const animationLoop = (props.animationLoop as boolean) ?? false;
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePreview = () => {
    if (!animationEntry || !nodeId) return;
    const el = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement | null;
    if (!el) return;

    el.classList.remove("animate__animated", `animate__${animationEntry}`);
    void el.offsetHeight;
    el.style.animationDuration = `${animationDuration}s`;
    el.classList.add("animate__animated", `animate__${animationEntry}`);

    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
      el.classList.remove("animate__animated", `animate__${animationEntry}`);
    }, animationDuration * 1000 + 200);
  };

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs text-gray-500 block mb-1">Hiệu ứng xuất hiện</span>
        <select
          value={animationEntry}
          onChange={(e) => setProp((p) => { p.animationEntry = e.target.value; })}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          <option value="">— Không chọn —</option>
          {ANIMATION_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between mb-0.5">
          <span className="text-xs text-gray-500">Thời gian (giây)</span>
          <span className="text-xs text-gray-400 font-mono">{animationDuration}s</span>
        </div>
        <input
          type="range"
          min={0.2}
          max={5}
          step={0.1}
          value={animationDuration}
          onChange={(e) => setProp((p) => { p.animationDuration = Number(e.target.value); })}
          className="w-full h-1 accent-indigo-500"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={animationLoop}
          onChange={(e) => setProp((p) => { p.animationLoop = e.target.checked; })}
          className="rounded accent-indigo-500"
        />
        <span className="text-xs text-gray-600">Lặp lại</span>
      </label>

      {animationEntry && (
        <button
          type="button"
          onClick={handlePreview}
          className="w-full text-xs py-1.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
        >
          ▶ Xem trước
        </button>
      )}

      {animationEntry && (
        <button
          type="button"
          onClick={() => setProp((p) => { p.animationEntry = ""; p.animationLoop = false; })}
          className="w-full text-xs py-1 rounded text-gray-400 hover:text-gray-600 border border-gray-100 hover:bg-gray-50"
        >
          Xóa hiệu ứng
        </button>
      )}

      <div className="pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 block mb-1">Hiệu ứng khi rê chuột (trên thiệp)</span>
        <select
          value={(props.hoverEffect as string) ?? "none"}
          onChange={(e) => setProp((p) => { p.hoverEffect = e.target.value; })}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          <option value="none">— Không chọn —</option>
          <option value="scale-up">Phóng to nhẹ</option>
          <option value="scale-down">Thu nhỏ nhẹ</option>
          <option value="glow">Phát sáng</option>
          <option value="shake">Rung</option>
          <option value="rotate">Xoay nhẹ</option>
        </select>
      </div>
    </div>
  );
}
