"use client";

import { useRef, useState } from "react";
import { Music2, Play, Square, Check } from "lucide-react";
import {
  DEFAULT_BACKGROUND_MUSIC_URL,
  INVITATION_MUSIC_PRESETS,
  findMusicPresetByUrl,
  type MusicPreset,
} from "@/lib/data/invitation-music-presets";

type Props = {
  selectedUrl: string | null | undefined;
  onSelect: (url: string) => void;
  onClear: () => void;
  disabled?: boolean;
};

export function MusicPresetPicker({ selectedUrl, onSelect, onClear, disabled }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const selectedPreset = findMusicPresetByUrl(selectedUrl);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPreviewId(null);
  };

  const togglePreview = (preset: MusicPreset) => {
    if (previewId === preset.id) {
      stopPreview();
      return;
    }
    stopPreview();
    const audio = new Audio(preset.url);
    audioRef.current = audio;
    setPreviewId(preset.id);
    void audio.play().catch(() => setPreviewId(null));
    audio.onended = () => setPreviewId(null);
  };

  if (INVITATION_MUSIC_PRESETS.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
        Chưa có nhạc mẫu. Bạn có thể upload file MP3 bên dưới hoặc thêm URL mẫu vào hệ thống sau.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {!selectedUrl && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            stopPreview();
            onSelect(DEFAULT_BACKGROUND_MUSIC_URL);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
        >
          <Music2 className="h-4 w-4" />
          Bật nhạc mặc định
        </button>
      )}
      <p className="text-sm font-medium text-neutral-800">Nhạc mẫu có sẵn</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {INVITATION_MUSIC_PRESETS.map((preset) => {
          const isSelected = selectedUrl === preset.url;
          const isPlaying = previewId === preset.id;
          return (
            <div
              key={preset.id}
              className={`flex flex-col gap-2 rounded-xl border p-3 transition ${
                isSelected
                  ? "border-rose-400 bg-rose-50"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <Music2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800">{preset.label}</p>
                  {preset.durationLabel && (
                    <p className="text-xs text-neutral-500">{preset.durationLabel}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => togglePreview(preset)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {isPlaying ? (
                    <>
                      <Square className="h-3 w-3" /> Dừng
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" /> Nghe thử
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={disabled || isSelected}
                  onClick={() => {
                    stopPreview();
                    onSelect(preset.url);
                  }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-rose-600 disabled:opacity-50"
                >
                  {isSelected ? (
                    <>
                      <Check className="h-3 w-3" /> Đã chọn
                    </>
                  ) : (
                    "Chọn"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUrl && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          <span className="min-w-0 truncate">
            Đang dùng:{" "}
            <strong className="font-medium text-neutral-800">
              {selectedPreset?.label ?? "File tải lên"}
            </strong>
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              stopPreview();
              onClear();
            }}
            className="shrink-0 text-rose-600 hover:underline disabled:opacity-50"
          >
            Xóa nhạc
          </button>
        </div>
      )}
    </div>
  );
}
