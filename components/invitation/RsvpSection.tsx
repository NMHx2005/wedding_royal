"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  cardId: string;
  defaultName?: string;
  guestId?: string | null;
};

export function RsvpSection({ cardId, defaultName = "", guestId }: Props) {
  const [name, setName] = useState(defaultName);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (attending === null) {
      toast.error("Vui lòng chọn tham dự hoặc vắng mặt");
      return;
    }
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          guestName: name.trim(),
          attending,
          guestCount,
          note: note.trim() || null,
          guestId: guestId ?? null,
        }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Lỗi");
        return;
      }
      toast.success(json.message ?? "Đã gửi");
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <section className="px-4 py-16 text-center">
        <p className="text-lg font-medium">Cảm ơn bạn đã xác nhận!</p>
        <p className="mt-2 text-sm text-neutral-600">Hẹn gặp trong ngày vui của chúng mình.</p>
      </section>
    );
  }

  return (
    <section className="px-4 py-16">
      <h2 className="text-center font-serif text-2xl">Bạn có tham dự không?</h2>
      <div className="mx-auto mt-8 max-w-md space-y-4 rounded-2xl border border-neutral-100 bg-white/80 p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium">Tên của bạn</label>
          <input
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 p-3">
            <input
              type="radio"
              name="att"
              checked={attending === true}
              onChange={() => setAttending(true)}
            />
            Tham dự
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 p-3">
            <input
              type="radio"
              name="att"
              checked={attending === false}
              onChange={() => setAttending(false)}
            />
            Vắng mặt
          </label>
        </div>
        {attending === true && (
          <div>
            <label className="text-sm font-medium">Số người đi cùng</label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className="h-9 w-9 rounded-lg border"
                onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{guestCount}</span>
              <button
                type="button"
                className="h-9 w-9 rounded-lg border"
                onClick={() => setGuestCount((c) => Math.min(50, c + 1))}
              >
                +
              </button>
            </div>
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Ghi chú (tuỳ chọn)</label>
          <textarea
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={submit}
          className="w-full rounded-lg bg-mewedding-rose py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Đang gửi…" : "Xác nhận"}
        </button>
      </div>
    </section>
  );
}
