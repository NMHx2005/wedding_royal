"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Wish = {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
};

type Props = {
  cardId: string;
};

export function WishesSection({ cardId }: Props) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/wishes?cardId=${encodeURIComponent(cardId)}`);
    const json = (await res.json()) as { wishes?: Wish[] };
    setWishes(json.wishes ?? []);
  }, [cardId]);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    if (!name.trim() || !message.trim()) {
      toast.error("Nhập tên và lời chúc");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          guestName: name.trim(),
          message: message.trim(),
        }),
      });
      const json = (await res.json()) as { error?: string; wish?: Wish };
      if (!res.ok) {
        toast.error(json.error ?? "Lỗi");
        return;
      }
      if (json.wish) {
        setWishes((w) => [json.wish as Wish, ...w]);
      }
      setMessage("");
      toast.success("Đã gửi lời chúc");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 py-16">
      <h2 className="text-center font-serif text-2xl">Sổ lưu bút</h2>
      <div className="mx-auto mt-6 flex max-w-md snap-x gap-3 overflow-x-auto pb-2">
        {wishes.map((w) => (
          <div
            key={w.id}
            className="min-w-[220px] max-w-[260px] snap-start rounded-xl border border-neutral-100 bg-white/90 p-4 shadow-sm"
          >
            <p className="font-medium text-neutral-900">{w.guest_name}</p>
            <p className="mt-2 text-sm text-neutral-700">{w.message}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl border border-neutral-100 bg-white/90 p-6 shadow-sm">
        <input
          placeholder="Tên của bạn"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Lời chúc (tối đa 500 ký tự)"
          rows={4}
          maxLength={500}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          disabled={loading}
          onClick={send}
          className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Đang gửi…" : "Gửi lời chúc"}
        </button>
      </div>
    </section>
  );
}
