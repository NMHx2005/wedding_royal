"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import type { ContactSettings, SocialSettings } from "@/types";
import { MarketingMobileNav } from "@/components/landing/MarketingMobileNav";

type Props = {
  contact: ContactSettings;
  social: SocialSettings;
};

export function LienHeClient({ contact, social }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Tư vấn thiệp cưới Royal Wedding");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Vui lòng nhập họ tên và nội dung liên hệ");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Không gửi được tin nhắn. Vui lòng thử lại.");
        return;
      }
      toast.success("Đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất.");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Lỗi kết nối. Vui lòng thử lại sau.");
    } finally {
      setSending(false);
    }
  };

  const socialLinks = [
    contact.phone
      ? { label: "Điện thoại", href: `tel:${contact.phone}`, icon: <Phone className="h-5 w-5" />, display: contact.phone }
      : null,
    social.facebook
      ? { label: "Facebook", href: social.facebook, icon: <span className="text-sm font-bold">fb</span>, display: "Facebook" }
      : null,
    social.zalo
      ? { label: "Zalo", href: social.zalo, icon: <MessageCircle className="h-5 w-5" />, display: "Zalo" }
      : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <MarketingMobileNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-violet-50/30 pt-6 md:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(244,63,94,0.1),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Liên hệ</p>
          <h1 className="mt-3 max-w-2xl font-sans text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Gửi câu hỏi về thiệp cưới, gói dịch vụ hoặc hỗ trợ kỹ thuật — đội ngũ Royal Wedding phản hồi nhanh qua email và các kênh mạng xã hội.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="border-t border-rose-100/60 bg-neutral-50/50 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-5 lg:gap-12">
          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900">Gửi tin nhắn cho chúng tôi</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Điền form bên dưới — tin nhắn được lưu và đội ngũ Royal Wedding sẽ phản hồi qua email hoặc điện thoại.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-neutral-800">
                      Họ và tên <span className="text-rose-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none ring-rose-200 transition focus:border-rose-300 focus:ring-2"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-neutral-800">Số điện thoại</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none ring-rose-200 transition focus:border-rose-300 focus:ring-2"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-neutral-800">Email của bạn</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@email.com"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none ring-rose-200 transition focus:border-rose-300 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-neutral-800">Chủ đề</span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none ring-rose-200 transition focus:border-rose-300 focus:ring-2"
                  >
                    <option>Tư vấn thiệp cưới Royal Wedding</option>
                    <option>Hỗ trợ kỹ thuật / sửa thiệp</option>
                    <option>Thanh toán và nâng cấp gói</option>
                    <option>Hợp tác đại lý / nhà sáng tạo</option>
                    <option>Khác</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-neutral-800">
                    Nội dung <span className="text-rose-500">*</span>
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Mô tả yêu cầu của bạn…"
                    className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none ring-rose-200 transition focus:border-rose-300 focus:ring-2"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-70 sm:w-auto"
                >
                  <Send className="h-4 w-4" aria-hidden />
                  Gửi liên hệ
                </button>
              </form>
            </div>
          </div>

          {/* Info sidebar */}
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-rose-600">Royal Wedding</h2>
              <p className="mt-1 text-sm text-neutral-600">Gửi hạnh phúc — Kết nối yêu thương</p>
              <ul className="mt-4 space-y-4 text-sm text-neutral-700">
                {contact.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                    <div>
                      <p className="font-medium text-neutral-900">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-rose-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                    <div>
                      <p className="font-medium text-neutral-900">Hotline</p>
                      <a href={`tel:${contact.phone}`} className="text-rose-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  </li>
                )}
                {contact.address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                    <div>
                      <p className="font-medium text-neutral-900">Địa chỉ</p>
                      <p className="leading-relaxed">{contact.address}</p>
                      {contact.tax_url && (
                        <a
                          href={contact.tax_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-rose-600 hover:underline"
                        >
                          Tra cứu mã số thuế
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </li>
                )}
                {contact.working_hours && (
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                    <div>
                      <p className="font-medium text-neutral-900">Giờ hỗ trợ</p>
                      <p>{contact.working_hours}</p>
                    </div>
                  </li>
                )}
              </ul>
              {/* Social links */}
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((s) =>
                  s ? (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={s.label}
                    >
                      {s.icon}
                      <span className="text-xs font-medium">{s.display}</span>
                    </a>
                  ) : null
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6">
              <div className="flex gap-3">
                <MessageCircle className="h-6 w-6 shrink-0 text-rose-500" aria-hidden />
                <div>
                  <p className="font-semibold text-neutral-900">Cần hỗ trợ gấp?</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Xem{" "}
                    <Link href="/bang-gia" className="font-medium text-rose-600 hover:underline">
                      bảng giá
                    </Link>{" "}
                    hoặc{" "}
                    <Link href="/register" className="font-medium text-rose-600 hover:underline">
                      tạo thiệp online
                    </Link>
                    .
                  </p>
                  <a
                    href={`mailto:${contact.email}?subject=${encodeURIComponent("Hỗ trợ gấp Royal Wedding")}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Gửi email hỗ trợ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
