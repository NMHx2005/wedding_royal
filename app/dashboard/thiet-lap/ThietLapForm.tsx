"use client";

import { useCallback, useState, useTransition } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import { toast } from "sonner";
import type { WeddingCard, WeddingPhoto } from "@/types";
import { updateWeddingCard, checkSlugAvailable, addWeddingPhoto, deleteWeddingPhoto } from "@/app/actions/wedding-card";
import { mapsUrlToEmbed } from "@/lib/utils";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { useRouter } from "next/navigation";

type Props = {
  card: WeddingCard;
  photos: WeddingPhoto[];
  initialTemplateFromQuery?: string;
};

export function ThietLapForm({ card, photos: initialPhotos, initialTemplateFromQuery }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [photos, setPhotos] = useState(initialPhotos);
  const [form, setForm] = useState(() => ({
    bride_name: card.bride_name,
    bride_parents: card.bride_parents ?? "",
    groom_name: card.groom_name,
    groom_parents: card.groom_parents ?? "",
    wedding_date: card.wedding_date.slice(0, 16),
    ceremony_time: card.ceremony_time ?? "",
    reception_time: card.reception_time ?? "",
    venue_name: card.venue_name ?? "",
    venue_address: card.venue_address ?? "",
    venue_maps_url: card.venue_maps_url ?? "",
    hashtag: card.hashtag ?? "",
    love_story: card.love_story ?? "",
    cover_image_url: card.cover_image_url ?? "",
    background_music_url: card.background_music_url ?? "",
    confetti_effect: card.confetti_effect,
    show_gift_box: card.show_gift_box,
    gift_bank_name: card.gift_bank_name ?? "",
    gift_account_number: card.gift_account_number ?? "",
    gift_account_name: card.gift_account_name ?? "",
    gift_qr_url: card.gift_qr_url ?? "",
    slug: card.slug,
    status: card.status,
    template_id: initialTemplateFromQuery ?? card.template_id,
  }));

  const [slugOk, setSlugOk] = useState<boolean | null>(null);

  const save = (patch: Record<string, unknown>) => {
    start(async () => {
      const { error } = await updateWeddingCard(card.id, patch);
      if (error) toast.error(error);
      else {
        toast.success("Đã lưu");
        router.refresh();
      }
    });
  };

  const onSaveBasic = () => {
    const maps = form.venue_maps_url.trim() ? mapsUrlToEmbed(form.venue_maps_url) : null;
    save({
      bride_name: form.bride_name,
      bride_parents: form.bride_parents || null,
      groom_name: form.groom_name,
      groom_parents: form.groom_parents || null,
      wedding_date: new Date(form.wedding_date).toISOString(),
      ceremony_time: form.ceremony_time || null,
      reception_time: form.reception_time || null,
      venue_name: form.venue_name || null,
      venue_address: form.venue_address || null,
      venue_maps_url: maps,
      hashtag: form.hashtag || null,
    });
  };

  const onSaveStory = () => {
    save({
      love_story: form.love_story || null,
      cover_image_url: form.cover_image_url || null,
    });
  };

  const onSaveMusic = () => {
    save({
      background_music_url: form.background_music_url || null,
      confetti_effect: form.confetti_effect,
    });
  };

  const onSaveGift = () => {
    save({
      show_gift_box: form.show_gift_box,
      gift_bank_name: form.gift_bank_name || null,
      gift_account_number: form.gift_account_number || null,
      gift_account_name: form.gift_account_name || null,
      gift_qr_url: form.gift_qr_url || null,
    });
  };

  const onSaveUrl = async () => {
    const { available, error } = await checkSlugAvailable(form.slug, card.id);
    if (error) {
      toast.error(error);
      return;
    }
    if (!available) {
      toast.error("Slug đã được sử dụng");
      return;
    }
    save({
      slug: form.slug,
      status: form.status,
      template_id: form.template_id,
    });
  };

  const checkSlug = useCallback(async (slug: string) => {
    const { available } = await checkSlugAvailable(slug, card.id);
    setSlugOk(available);
  }, [card.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Thiết lập thiệp</h1>
        <p className="text-sm text-neutral-600">Lưu từng tab sau khi chỉnh sửa.</p>
      </div>

      <Tabs.Root defaultValue="basic" className="w-full">
        <Tabs.List className="flex flex-wrap gap-2 border-b border-neutral-200 pb-2">
          {[
            ["basic", "Thông tin"],
            ["story", "Câu chuyện"],
            ["album", "Album"],
            ["music", "Nhạc & hiệu ứng"],
            ["gift", "Mừng cưới"],
            ["url", "URL"],
          ].map(([v, l]) => (
            <Tabs.Trigger
              key={v}
              value={v}
              className="rounded-full px-3 py-1.5 text-sm data-[state=active]:bg-rose-50 data-[state=active]:text-mewedding-rose"
            >
              {l}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="basic" className="mt-4 space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <Field label="Tên cô dâu" value={form.bride_name} onChange={(v) => setForm((f) => ({ ...f, bride_name: v }))} />
          <Field
            label="Cha mẹ cô dâu"
            value={form.bride_parents}
            onChange={(v) => setForm((f) => ({ ...f, bride_parents: v }))}
          />
          <Field label="Tên chú rể" value={form.groom_name} onChange={(v) => setForm((f) => ({ ...f, groom_name: v }))} />
          <Field
            label="Cha mẹ chú rể"
            value={form.groom_parents}
            onChange={(v) => setForm((f) => ({ ...f, groom_parents: v }))}
          />
          <div>
            <label className="text-sm font-medium">Ngày giờ cưới</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={form.wedding_date}
              onChange={(e) => setForm((f) => ({ ...f, wedding_date: e.target.value }))}
            />
          </div>
          <Field
            label="Giờ lễ"
            value={form.ceremony_time}
            onChange={(v) => setForm((f) => ({ ...f, ceremony_time: v }))}
          />
          <Field
            label="Giờ tiệc"
            value={form.reception_time}
            onChange={(v) => setForm((f) => ({ ...f, reception_time: v }))}
          />
          <Field label="Tên địa điểm" value={form.venue_name} onChange={(v) => setForm((f) => ({ ...f, venue_name: v }))} />
          <Field
            label="Địa chỉ"
            value={form.venue_address}
            onChange={(v) => setForm((f) => ({ ...f, venue_address: v }))}
          />
          <Field
            label="Google Maps (URL)"
            value={form.venue_maps_url}
            onChange={(v) => setForm((f) => ({ ...f, venue_maps_url: v }))}
          />
          <Field label="Hashtag" value={form.hashtag} onChange={(v) => setForm((f) => ({ ...f, hashtag: v }))} />
          <button
            type="button"
            disabled={pending}
            onClick={onSaveBasic}
            className="rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Lưu thay đổi
          </button>
        </Tabs.Content>

        <Tabs.Content value="story" className="mt-4 space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <div>
            <label className="text-sm font-medium">Câu chuyện tình yêu</label>
            <textarea
              rows={8}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={form.love_story}
              onChange={(e) => setForm((f) => ({ ...f, love_story: e.target.value }))}
            />
          </div>
          <p className="text-sm font-medium">Ảnh đại diện</p>
          <PhotoUpload
            cardId={card.id}
            plan={card.plan}
            currentCount={form.cover_image_url ? 1 : 0}
            maxTotal={1}
            bucket="wedding-photos"
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            maxFiles={1}
            label="Tải ảnh đại diện cặp đôi"
            onUploaded={(url) => {
              setForm((f) => ({ ...f, cover_image_url: url }));
              void (async () => {
                const { error } = await updateWeddingCard(card.id, { cover_image_url: url });
                if (error) toast.error(error);
                else toast.success("Đã cập nhật ảnh đại diện");
              })();
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={onSaveStory}
            className="rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Lưu thay đổi
          </button>
        </Tabs.Content>

        <Tabs.Content value="album" className="mt-4 space-y-4 rounded-xl border border-neutral-100 bg-white p-4">
          <PhotoUpload
            cardId={card.id}
            plan={card.plan}
            currentCount={photos.length}
            bucket="wedding-photos"
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            onUploaded={async (url) => {
              const { error } = await addWeddingPhoto(card.id, url);
              if (error) toast.error(error);
              else {
                toast.success("Đã thêm ảnh");
                router.refresh();
              }
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-black/50 px-1 text-xs text-white"
                  onClick={async () => {
                    const { error } = await deleteWeddingPhoto(p.id);
                    if (error) toast.error(error);
                    else {
                      setPhotos((prev) => prev.filter((x) => x.id !== p.id));
                      toast.success("Đã xóa");
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </Tabs.Content>

        <Tabs.Content value="music" className="mt-4 space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <PhotoUpload
            cardId={card.id}
            plan={card.plan}
            currentCount={form.background_music_url ? 1 : 0}
            maxTotal={1}
            bucket="wedding-music"
            accept={{ "audio/mpeg": [".mp3"] }}
            maxFiles={1}
            label="Upload nhạc MP3"
            onUploaded={async (url) => {
              setForm((f) => ({ ...f, background_music_url: url }));
              const { error } = await updateWeddingCard(card.id, { background_music_url: url });
              if (error) toast.error(error);
              else toast.success("Đã lưu nhạc nền");
            }}
          />
          <div>
            <label className="text-sm font-medium">Hiệu ứng rơi</label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={form.confetti_effect}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  confetti_effect: e.target.value as WeddingCard["confetti_effect"],
                }))
              }
            >
              <option value="none">Không</option>
              <option value="hearts">Tim</option>
              <option value="snow">Tuyết</option>
              <option value="petals">Hoa</option>
            </select>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onSaveMusic}
            className="rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Lưu thay đổi
          </button>
        </Tabs.Content>

        <Tabs.Content value="gift" className="mt-4 space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Bật hộp mừng cưới</span>
            <Switch.Root
              checked={form.show_gift_box}
              onCheckedChange={(v) => setForm((f) => ({ ...f, show_gift_box: v }))}
              className="h-6 w-11 rounded-full bg-neutral-200 data-[state=checked]:bg-mewedding-rose"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
          <Field label="Ngân hàng" value={form.gift_bank_name} onChange={(v) => setForm((f) => ({ ...f, gift_bank_name: v }))} />
          <Field
            label="Số tài khoản"
            value={form.gift_account_number}
            onChange={(v) => setForm((f) => ({ ...f, gift_account_number: v }))}
          />
          <Field
            label="Tên chủ TK"
            value={form.gift_account_name}
            onChange={(v) => setForm((f) => ({ ...f, gift_account_name: v }))}
          />
          <PhotoUpload
            cardId={card.id}
            plan={card.plan}
            currentCount={form.gift_qr_url ? 1 : 0}
            maxTotal={1}
            bucket="wedding-photos"
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            maxFiles={1}
            label="Upload ảnh QR"
            onUploaded={async (url) => {
              setForm((f) => ({ ...f, gift_qr_url: url }));
              const { error } = await updateWeddingCard(card.id, { gift_qr_url: url });
              if (error) toast.error(error);
              else toast.success("Đã lưu QR");
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={onSaveGift}
            className="rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Lưu thay đổi
          </button>
        </Tabs.Content>

        <Tabs.Content value="url" className="mt-4 space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
          <div>
            <label className="text-sm font-medium">Slug URL</label>
            <input
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={form.slug}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({ ...f, slug: v }));
                void checkSlug(v);
              }}
            />
            {slugOk === false && <p className="mt-1 text-xs text-red-600">Slug đã tồn tại</p>}
            {slugOk === true && <p className="mt-1 text-xs text-green-600">Slug khả dụng</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as WeddingCard["status"] }))
              }
            >
              <option value="draft">Nháp</option>
              <option value="active">Công khai</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Mẫu thiệp</label>
            <select
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
              value={form.template_id}
              onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value }))}
            >
              <option value="classic-white">Classic White</option>
              <option value="golden-luxury">Golden Luxury (Pro+)</option>
              <option value="minimal-modern">Minimal Modern (Pro+)</option>
            </select>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onSaveUrl}
            className="rounded-lg bg-mewedding-rose px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Lưu thay đổi
          </button>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="mt-1 w-full rounded border px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
