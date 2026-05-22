"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useEditor } from "@craftjs/core";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { getSavedTemplates, deleteSavedTemplate, type SavedTemplate } from "@/app/actions/saved-templates";
import { cloneSubtreeFromContent, getRootSectionIds } from "@/lib/editor/cloneSubtree";
import { migrateContentJson } from "@/lib/editor/migrateContentJson";

export function SavedTemplatesPanel() {
  const confirmDialog = useConfirm();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { actions, query } = useEditor();

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getSavedTemplates();
    setTemplates(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInsertSections = (tmpl: SavedTemplate) => {
    try {
      const content = tmpl.content_json as Record<string, unknown>;
      const sectionIds = getRootSectionIds(content);
      if (sectionIds.length === 0) {
        alert("Mẫu không có section để chèn.");
        return;
      }
      const rootNodes = query.node("ROOT").get().data.nodes ?? [];
      let index = rootNodes.length;
      for (const sectionId of sectionIds) {
        const { rootNodeId, nodes } = cloneSubtreeFromContent(content, sectionId, "ROOT");
        actions.addNodeTree(
          { nodes: nodes as Parameters<typeof actions.addNodeTree>[0]["nodes"], rootNodeId },
          "ROOT",
          index
        );
        index += 1;
      }
    } catch {
      alert("Không thể chèn mẫu. Vui lòng thử lại.");
    }
  };

  const handleReplaceAll = async (tmpl: SavedTemplate) => {
    const ok = await confirmDialog({
      title: "Thay toàn bộ nội dung",
      message: "Thay toàn bộ nội dung thiệp bằng mẫu này? Hành động không hoàn tác được.",
      confirmLabel: "Thay thế",
      variant: "warning",
    });
    if (!ok) return;
    try {
      actions.deserialize(
        JSON.stringify(migrateContentJson(tmpl.content_json as Record<string, unknown>))
      );
    } catch {
      alert("Không thể áp dụng mẫu. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: "Xóa mẫu",
      message: "Bạn có chắc muốn xoá mẫu này?",
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (!ok) return;
    await deleteSavedTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) {
    return <p className="text-xs text-gray-400 p-3 text-center">Đang tải...</p>;
  }

  if (templates.length === 0) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs text-gray-400 mb-1">Chưa có mẫu đã lưu.</p>
        <p className="text-[10px] text-gray-300">Dùng nút Lưu mẫu trên toolbar để lưu.</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {templates.map((tmpl) => (
        <div
          key={tmpl.id}
          className="flex flex-col gap-1.5 p-2 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 group transition-colors"
        >
          <div className="flex items-start justify-between gap-1 min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700 truncate">{tmpl.name}</p>
              <p className="text-[10px] text-gray-400">{tmpl.category}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleDelete(tmpl.id)}
              title="Xoá mẫu"
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 shrink-0 transition-opacity p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleInsertSections(tmpl)}
              className="flex-1 text-[10px] py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-medium"
            >
              Chèn section
            </button>
            <button
              type="button"
              onClick={() => void handleReplaceAll(tmpl)}
              className="flex-1 text-[10px] py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Thay toàn bộ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
