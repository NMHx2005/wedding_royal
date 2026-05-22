"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "@craftjs/core";
import { useConfirm } from "@/components/ui/ConfirmProvider";

const HISTORY_KEY = "craft-editor-history";
const MAX_SNAPSHOTS = 50;
const DEBOUNCE_MS = 2000;

interface Snapshot {
  ts: number;
  label: string;
  json: string;
}

function getStoredHistory(): Snapshot[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]") as Snapshot[];
  } catch {
    return [];
  }
}

function saveToStorage(snaps: Snapshot[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(snaps.slice(-MAX_SNAPSHOTS)));
  } catch { /* quota */ }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function HistoryPanel() {
  const confirmDialog = useConfirm();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  useEffect(() => {
    setSnapshots(getStoredHistory());
  }, []);
  const { query, actions } = useEditor();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastJsonRef = useRef<string>("");

  const captureSnapshot = useCallback(() => {
    try {
      const json = query.serialize();
      if (json === lastJsonRef.current) return;
      lastJsonRef.current = json;
      const snap: Snapshot = { ts: Date.now(), label: `Lúc ${formatTime(Date.now())}`, json };
      setSnapshots((prev) => {
        const next = [...prev, snap].slice(-MAX_SNAPSHOTS);
        saveToStorage(next);
        return next;
      });
    } catch { /* ignore */ }
  }, [query]);

  // Watch for node changes via polling
  useEffect(() => {
    const poll = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(captureSnapshot, DEBOUNCE_MS);
    };
    const unsub = (query as unknown as { subscribe: (fn: () => void, listener: () => void) => () => void })
      .subscribe?.(() => {}, poll);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof unsub === "function") unsub();
    };
  }, [captureSnapshot, query]);

  const handleRestore = async (snap: Snapshot) => {
    const ok = await confirmDialog({
      title: "Khôi phục phiên bản",
      message: `Khôi phục về trạng thái lúc ${formatTime(snap.ts)}?`,
      confirmLabel: "Khôi phục",
      variant: "warning",
    });
    if (!ok) return;
    try {
      actions.deserialize(snap.json);
    } catch {
      alert("Không thể khôi phục snapshot này.");
    }
  };

  const handleClear = async () => {
    const ok = await confirmDialog({
      title: "Xóa lịch sử",
      message: "Xoá toàn bộ lịch sử chỉnh sửa? Thao tác không thể hoàn tác.",
      confirmLabel: "Xóa hết",
      variant: "danger",
    });
    if (!ok) return;
    setSnapshots([]);
    sessionStorage.removeItem(HISTORY_KEY);
  };

  const displayed = [...snapshots].reverse();

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">Lịch sử ({displayed.length})</span>
        {displayed.length > 0 && (
          <button onClick={() => void handleClear()} className="text-[10px] text-red-400 hover:text-red-600">
            Xoá hết
          </button>
        )}
      </div>

      {displayed.length === 0 && (
        <p className="text-[10px] text-gray-400 text-center py-4">
          Chưa có lịch sử. Các thay đổi sẽ được ghi lại tự động.
        </p>
      )}

      <div className="space-y-1">
        {displayed.map((snap, i) => (
          <button
            key={snap.ts}
            type="button"
            onClick={() => void handleRestore(snap)}
            className="w-full text-left p-2 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs text-gray-600">{snap.label}</span>
              {i === 0 && (
                <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1 rounded">Mới nhất</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
