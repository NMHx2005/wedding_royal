"use client";

import React from "react";
import type { SharedEventItem } from "../../utils/styleHelpers";
import { runBlockEvent } from "@/lib/editor/runBlockEvent";

type SetPropFn = (fn: (p: Record<string, unknown>) => void) => void;

const TRIGGER_OPTIONS = [
  { value: "click", label: "Nhấn (Click)" },
  { value: "hover", label: "Di chuột (Hover)" },
];

const ACTION_OPTIONS = [
  { value: "link", label: "Mở liên kết" },
  { value: "call", label: "Gọi điện" },
  { value: "email", label: "Gửi email" },
  { value: "navigate-section", label: "Cuộn đến mục" },
  { value: "toggle-element", label: "Ẩn/Hiện phần tử" },
  { value: "copy-clipboard", label: "Sao chép văn bản" },
  { value: "open-lightbox", label: "Xem ảnh lớn" },
  { value: "open-popup", label: "Mở popup" },
  { value: "add-to-calendar", label: "Thêm lịch Google" },
];

const ACTION_PARAMS: Record<string, { key: string; label: string; placeholder: string; useDropdown?: boolean }[]> = {
  link: [{ key: "url", label: "URL", placeholder: "https://..." }],
  call: [{ key: "phone", label: "Số điện thoại", placeholder: "+84..." }],
  email: [{ key: "email", label: "Email", placeholder: "hello@example.com" }],
  "navigate-section": [{ key: "sectionId", label: "ID mục", placeholder: "el_section", useDropdown: true }],
  "toggle-element": [{ key: "targetId", label: "ID phần tử", placeholder: "el_xxxx", useDropdown: true }],
  "copy-clipboard": [{ key: "text", label: "Nội dung", placeholder: "Nội dung sao chép..." }],
  "open-lightbox": [{ key: "imageUrl", label: "URL ảnh", placeholder: "https://..." }],
  "open-popup": [{ key: "popupId", label: "ID popup", placeholder: "popup_1", useDropdown: true }],
  "add-to-calendar": [
    { key: "title", label: "Tiêu đề", placeholder: "Đám cưới" },
    { key: "start", label: "Bắt đầu (ISO)", placeholder: "2026-05-17T10:00:00" },
    { key: "end", label: "Kết thúc (ISO)", placeholder: "2026-05-17T12:00:00" },
    { key: "location", label: "Địa điểm", placeholder: "Địa chỉ..." },
  ],
};

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

interface EventsPanelProps {
  props: Record<string, unknown>;
  setProp: SetPropFn;
  elementIds?: { id: string; label: string }[];
}

export function EventsPanel({ props, setProp, elementIds = [] }: EventsPanelProps) {
  const events: SharedEventItem[] = (props.events as SharedEventItem[]) ?? [];

  const addEvent = () => {
    const newEvent: SharedEventItem = {
      id: generateId(),
      trigger: "click",
      action: "link",
      params: { url: "" },
    };
    setProp((p) => {
      const current = (p.events as SharedEventItem[]) ?? [];
      p.events = [...current, newEvent];
    });
  };

  const updateEvent = (id: string, updates: Partial<SharedEventItem>) => {
    setProp((p) => {
      const current = (p.events as SharedEventItem[]) ?? [];
      p.events = current.map((ev) =>
        ev.id === id ? { ...ev, ...updates } : ev
      );
    });
  };

  const removeEvent = (id: string) => {
    setProp((p) => {
      const current = (p.events as SharedEventItem[]) ?? [];
      p.events = current.filter((ev) => ev.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">
          Chưa có sự kiện nào.<br />Nhấn &quot;Thêm&quot; để bắt đầu.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => {
            const paramDefs = ACTION_PARAMS[ev.action] ?? [];
            return (
              <div key={ev.id} className="border border-gray-200 rounded p-2 space-y-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">Sự kiện</span>
                  <button
                    type="button"
                    onClick={() => removeEvent(ev.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Khi</span>
                  <select
                    value={ev.trigger}
                    onChange={(e) =>
                      updateEvent(ev.id, { trigger: e.target.value as SharedEventItem["trigger"] })
                    }
                    className="w-full mt-0.5 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                  >
                    {TRIGGER_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-xs text-gray-500">Thực hiện</span>
                  <select
                    value={ev.action}
                    onChange={(e) =>
                      updateEvent(ev.id, {
                        action: e.target.value as SharedEventItem["action"],
                        params: {},
                      })
                    }
                    className="w-full mt-0.5 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                  >
                    {ACTION_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>

                {paramDefs.map((param) => (
                  <div key={param.key}>
                    <span className="text-xs text-gray-500">{param.label}</span>
                    {param.useDropdown && elementIds.length > 0 ? (
                      <select
                        value={ev.params[param.key] ?? ""}
                        onChange={(e) =>
                          updateEvent(ev.id, {
                            params: { ...ev.params, [param.key]: e.target.value },
                          })
                        }
                        className="w-full mt-0.5 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none"
                      >
                        <option value="">— Chọn ID —</option>
                        {elementIds.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={ev.params[param.key] ?? ""}
                        placeholder={param.placeholder}
                        onChange={(e) =>
                          updateEvent(ev.id, {
                            params: { ...ev.params, [param.key]: e.target.value },
                          })
                        }
                        className="w-full mt-0.5 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={addEvent}
        className="w-full text-xs py-1.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
      >
        + Thêm sự kiện
      </button>

      {events.length > 0 && (
        <button
          type="button"
          onClick={() => {
            const clickEv = events.find((e) => e.trigger === "click") ?? events[0];
            if (clickEv) runBlockEvent(clickEv);
          }}
          className="w-full text-xs py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ▶ Thử trên canvas
        </button>
      )}
    </div>
  );
}
