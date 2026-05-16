"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { WeddingCard, CardStatus, ConfettiEffect } from "@/types";

type Props = {
  card: WeddingCard | null;
};

type SectionKey = "cover" | "status" | "slug" | "content" | "design";

const CONFETTI_OPTIONS: { value: ConfettiEffect; label: string }[] = [
  { value: "none", label: "Không hiệu ứng" },
  { value: "hearts", label: "Trái tim ❤️" },
  { value: "snow", label: "Tuyết rơi ❄️" },
  { value: "petals", label: "Cánh hoa 🌸" },
];

const STATUS_OPTIONS: { value: CardStatus; label: string; desc: string }[] = [
  { value: "draft", label: "Nháp", desc: "Chỉ bạn thấy, khách chưa truy cập được" },
  { value: "active", label: "Công khai", desc: "Thiệp hiển thị với tất cả mọi người" },
  { value: "expired", label: "Đã hết hạn", desc: "Tắt thiệp, khách không truy cập được" },
];

const SLUG_REGEX = /^[a-z0-9-]+$/;

function SectionCard({
  title,
  description,
  sectionKey,
  open,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  sectionKey: SectionKey;
  open: boolean;
  onToggle: (key: SectionKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-6 py-4 text-left"
        onClick={() => onToggle(sectionKey)}
      >
        <div>
          <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
          )}
        </div>
        <span
          className={`text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-neutral-100 px-6 py-5">{children}</div>}
    </div>
  );
}

export default function CaiDatThiepClient({ card: initialCard }: Props) {
  const supabase = createClient();
  const [card, setCard] = useState<WeddingCard | null>(initialCard);
  const [openSection, setOpenSection] = useState<SectionKey>("cover");

  const toggleSection = (key: SectionKey) => {
    setOpenSection((prev) => (prev === key ? ("" as SectionKey) : key));
  };

  // ── Cover image ──────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverMsg, setCoverMsg] = useState("");

  const uploadCover = async (file: File) => {
    if (!card) return;
    setCoverUploading(true);
    setCoverMsg("");
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `covers/${card.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("wedding-photos")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setCoverMsg(`Lỗi upload: ${upErr.message}`);
      setCoverUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("wedding-photos")
      .getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    const { error: updateErr } = await supabase
      .from("wedding_cards")
      .update({ cover_image_url: publicUrl })
      .eq("id", card.id);
    if (updateErr) {
      setCoverMsg(`Lỗi cập nhật: ${updateErr.message}`);
    } else {
      setCard((prev) => (prev ? { ...prev, cover_image_url: publicUrl } : prev));
      setCoverMsg("Đã cập nhật ảnh bìa!");
    }
    setCoverUploading(false);
  };

  // ── Display status ───────────────────────────────────────────────────────
  const [statusValue, setStatusValue] = useState<CardStatus>(
    initialCard?.status ?? "draft"
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const saveStatus = async () => {
    if (!card) return;
    setStatusSaving(true);
    setStatusMsg("");
    const { error } = await supabase
      .from("wedding_cards")
      .update({ status: statusValue })
      .eq("id", card.id);
    setStatusSaving(false);
    if (error) {
      setStatusMsg(`Lỗi: ${error.message}`);
    } else {
      setCard((prev) => (prev ? { ...prev, status: statusValue } : prev));
      setStatusMsg("Đã lưu chế độ hiển thị!");
    }
  };

  // ── Slug ─────────────────────────────────────────────────────────────────
  const [slugValue, setSlugValue] = useState(initialCard?.slug ?? "");
  const [slugError, setSlugError] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugMsg, setSlugMsg] = useState("");

  const saveSlug = async () => {
    if (!card) return;
    setSlugError("");
    setSlugMsg("");
    if (!slugValue.trim()) {
      setSlugError("Slug không được để trống");
      return;
    }
    if (!SLUG_REGEX.test(slugValue)) {
      setSlugError("Chỉ dùng chữ thường, số và dấu gạch ngang (-)");
      return;
    }
    setSlugSaving(true);
    const { error } = await supabase
      .from("wedding_cards")
      .update({ slug: slugValue })
      .eq("id", card.id);
    setSlugSaving(false);
    if (error) {
      setSlugError(error.message.includes("unique")
        ? "Slug này đã được dùng, vui lòng chọn slug khác"
        : error.message
      );
    } else {
      setCard((prev) => (prev ? { ...prev, slug: slugValue } : prev));
      setSlugMsg("Đã lưu slug!");
    }
  };

  const cardUrl =
    typeof window !== "undefined" && card
      ? `${window.location.origin}/thiep/${slugValue}`
      : card
      ? `/thiep/${slugValue}`
      : "";

  // ── Content toggles ──────────────────────────────────────────────────────
  const [showGiftBox, setShowGiftBox] = useState(initialCard?.show_gift_box ?? false);
  const [confettiValue, setConfettiValue] = useState<ConfettiEffect>(
    initialCard?.confetti_effect ?? "none"
  );
  const [contentSaving, setContentSaving] = useState(false);
  const [contentMsg, setContentMsg] = useState("");

  const saveContent = async () => {
    if (!card) return;
    setContentSaving(true);
    setContentMsg("");
    const { error } = await supabase
      .from("wedding_cards")
      .update({ show_gift_box: showGiftBox, confetti_effect: confettiValue })
      .eq("id", card.id);
    setContentSaving(false);
    if (error) {
      setContentMsg(`Lỗi: ${error.message}`);
    } else {
      setCard((prev) =>
        prev
          ? { ...prev, show_gift_box: showGiftBox, confetti_effect: confettiValue }
          : prev
      );
      setContentMsg("Đã lưu nội dung hiển thị!");
    }
  };

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="text-5xl">💌</div>
        <h2 className="text-xl font-semibold text-neutral-700">Bạn chưa có thiệp cưới</h2>
        <p className="max-w-sm text-sm text-neutral-500">
          Tạo thiệp cưới để bắt đầu chia sẻ với khách mời của bạn
        </p>
        <Link
          href="/dashboard/thiet-lap"
          className="rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
        >
          Tạo thiệp ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Cài đặt thiệp cưới</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Quản lý hiển thị và cấu hình thiệp cưới của bạn
        </p>
      </div>

      {/* 1. Ảnh bìa */}
      <SectionCard
        title="Ảnh bìa"
        description="Ảnh chính hiển thị trên thiệp cưới"
        sectionKey="cover"
        open={openSection === "cover"}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          {card.cover_image_url ? (
            <div className="overflow-hidden rounded-xl border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.cover_image_url}
                alt="Ảnh bìa thiệp"
                className="h-48 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-400">Chưa có ảnh bìa</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              {coverUploading ? "Đang tải lên..." : "Chọn ảnh mới"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadCover(f);
                }}
              />
            </label>
            {coverMsg && (
              <p
                className={`text-sm ${
                  coverMsg.startsWith("Lỗi") ? "text-red-500" : "text-green-600"
                }`}
              >
                {coverMsg}
              </p>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            Định dạng: JPG, PNG, WebP. Kích thước tối đa 5MB.
          </p>
        </div>
      </SectionCard>

      {/* 2. Chế độ hiển thị */}
      <SectionCard
        title="Chế độ hiển thị"
        description="Kiểm soát ai có thể xem thiệp của bạn"
        sectionKey="status"
        open={openSection === "status"}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                statusValue === opt.value
                  ? "border-rose-400 bg-rose-50"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="card-status"
                value={opt.value}
                checked={statusValue === opt.value}
                onChange={() => setStatusValue(opt.value)}
                className="mt-0.5 accent-rose-500"
              />
              <div>
                <p className="text-sm font-semibold text-neutral-800">{opt.label}</p>
                <p className="text-xs text-neutral-500">{opt.desc}</p>
              </div>
            </label>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={statusSaving}
              onClick={() => void saveStatus()}
              className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
            >
              {statusSaving ? "Đang lưu..." : "Lưu"}
            </button>
            {statusMsg && (
              <p className={`text-sm ${statusMsg.startsWith("Lỗi") ? "text-red-500" : "text-green-600"}`}>
                {statusMsg}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 3. Slug tùy chỉnh */}
      <SectionCard
        title="Slug tùy chỉnh"
        description="Địa chỉ URL riêng của thiệp cưới"
        sectionKey="slug"
        open={openSection === "slug"}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-600">
              Slug
            </label>
            <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-neutral-200 focus-within:border-rose-400">
              <span className="border-r border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-400">
                /thiep/
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder="ten-co-dau-chu-re"
                value={slugValue}
                onChange={(e) => {
                  setSlugValue(e.target.value.toLowerCase());
                  setSlugError("");
                  setSlugMsg("");
                }}
              />
            </div>
            {slugError && <p className="mt-1 text-xs text-red-500">{slugError}</p>}
          </div>
          {slugValue && (
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Xem trước URL:</p>
              <a
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 break-all text-sm font-medium text-rose-500 hover:underline"
              >
                {cardUrl}
              </a>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={slugSaving}
              onClick={() => void saveSlug()}
              className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
            >
              {slugSaving ? "Đang lưu..." : "Lưu slug"}
            </button>
            {slugMsg && <p className="text-sm text-green-600">{slugMsg}</p>}
          </div>
          <p className="text-xs text-neutral-400">
            Chỉ dùng chữ thường (a–z), số (0–9) và dấu gạch ngang (-). Không dùng dấu tiếng Việt.
          </p>
        </div>
      </SectionCard>

      {/* 4. Nội dung hiển thị */}
      <SectionCard
        title="Nội dung hiển thị"
        description="Bật/tắt các thành phần trên thiệp"
        sectionKey="content"
        open={openSection === "content"}
        onToggle={toggleSection}
      >
        <div className="space-y-5">
          {/* Show gift box toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-800">Hộp quà / Tài khoản nhận quà</p>
              <p className="text-xs text-neutral-500">Hiện thông tin tài khoản ngân hàng để khách gửi quà</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showGiftBox}
              onClick={() => setShowGiftBox((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showGiftBox ? "bg-rose-500" : "bg-neutral-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  showGiftBox ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Confetti selector */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-800">Hiệu ứng confetti</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CONFETTI_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfettiValue(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                    confettiValue === opt.value
                      ? "border-rose-400 bg-rose-50 font-semibold text-rose-600"
                      : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={contentSaving}
              onClick={() => void saveContent()}
              className="rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
            >
              {contentSaving ? "Đang lưu..." : "Lưu cài đặt"}
            </button>
            {contentMsg && (
              <p className={`text-sm ${contentMsg.startsWith("Lỗi") ? "text-red-500" : "text-green-600"}`}>
                {contentMsg}
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 5. Thiết lập giao diện */}
      <SectionCard
        title="Thiết lập giao diện"
        description="Chọn template, màu sắc và font chữ"
        sectionKey="design"
        open={openSection === "design"}
        onToggle={toggleSection}
      >
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-neutral-600">
            Tùy chỉnh giao diện thiệp cưới chi tiết trong trang Thiết lập.
          </p>
          <Link
            href="/dashboard/thiet-lap"
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-rose-600"
          >
            Đến trang Thiết lập giao diện →
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
