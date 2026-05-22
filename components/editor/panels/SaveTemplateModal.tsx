"use client";

import React, { useState } from "react";
import { saveTemplate } from "@/app/actions/saved-templates";

interface SaveTemplateModalProps {
  contentJson: Record<string, unknown>;
  onClose: () => void;
  onSaved?: () => void;
}

const CATEGORIES = [
  { value: "general", label: "Chung" },
  { value: "hero", label: "Hero / Cover" },
  { value: "gallery", label: "Ảnh cưới" },
  { value: "countdown", label: "Đếm ngược" },
  { value: "invitation", label: "Lời mời" },
  { value: "map", label: "Bản đồ / Địa điểm" },
  { value: "gift", label: "Mừng cưới" },
];

export function SaveTemplateModal({ contentJson, onClose, onSaved }: SaveTemplateModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("Vui lòng nhập tên mẫu"); return; }
    setSaving(true);
    setError("");
    const result = await saveTemplate(name.trim(), category, contentJson);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Lưu mẫu thiệp</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tên mẫu *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hero hoa hồng gradient"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Huỷ
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu mẫu"}
          </button>
        </div>
      </div>
    </div>
  );
}
