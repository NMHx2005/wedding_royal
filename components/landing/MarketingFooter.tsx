import Link from "next/link";
import type { ContactSettings, SocialSettings } from "@/types";
import { createPublicSupabase } from "@/lib/supabase/public";

const DEFAULT_CONTACT: ContactSettings = {
  email: "hello@royalwedding.vn",
  phone: "0282 2222 886",
  address: "Tầng 5, 77 Nguyễn Huệ, Q.1, TP.HCM",
  tax_url: "",
  working_hours: "8:00 - 22:00, Thứ 2 - Chủ Nhật",
};

const DEFAULT_SOCIAL: SocialSettings = {
  facebook: "https://facebook.com/royalwedding",
  tiktok: "https://tiktok.com/@royalwedding",
  youtube: "https://youtube.com/@royalwedding",
  zalo: "https://zalo.me/royalwedding",
  instagram: "",
};

const serviceItems = [
  "Royal Wedding",
  "meBirthday (Coming Soon)",
  "meEvent (Coming Soon)",
  "Royal Wedding Invite",
  "meInvite",
  "meVideo",
  "Royal Wedding Planner",
];

const footerLinks = ["Trang chủ", "Điều khoản sử dụng", "Chính sách bảo mật", "Chăm sóc khách hàng", "Thanh toán"];

async function getSettings() {
  try {
    const supabase = createPublicSupabase();
    const { data } = await supabase
      .from("website_settings")
      .select("key, value")
      .in("key", ["contact", "social"]);

    const contactRow = data?.find((s) => s.key === "contact");
    const socialRow = data?.find((s) => s.key === "social");

    const contact: ContactSettings = contactRow
      ? { ...DEFAULT_CONTACT, ...(contactRow.value as Partial<ContactSettings>) }
      : DEFAULT_CONTACT;

    const social: SocialSettings = socialRow
      ? { ...DEFAULT_SOCIAL, ...(socialRow.value as Partial<SocialSettings>) }
      : DEFAULT_SOCIAL;

    return { contact, social };
  } catch {
    return { contact: DEFAULT_CONTACT, social: DEFAULT_SOCIAL };
  }
}

export async function MarketingFooter() {
  const { contact, social } = await getSettings();

  const socialItems = [
    { label: "Facebook", href: social.facebook },
    { label: "TikTok", href: social.tiktok },
    { label: "YouTube", href: social.youtube },
    { label: "Zalo", href: social.zalo },
    { label: "Instagram", href: social.instagram },
  ].filter((s) => s.href);

  return (
    <footer id="footer-id" className="border-t border-rose-100 bg-white">
      <div id="lien-he" className="scroll-mt-24 border-b border-rose-50 bg-gradient-to-b from-rose-50/40 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-4">
              <p className="text-lg font-bold text-rose-600">Royal Wedding</p>
              <div className="space-y-2 text-sm text-neutral-700">
                <p>Gửi hạnh phúc - Kết nối yêu thương</p>
                {contact.address && (
                  <p>Địa chỉ: {contact.address}</p>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="block text-rose-600 underline decoration-rose-300 underline-offset-2 hover:text-rose-700">
                    Email: {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="block text-rose-600 hover:text-rose-700">
                    Hotline: {contact.phone}
                  </a>
                )}
                {contact.tax_url && (
                  <a
                    href={contact.tax_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 underline decoration-rose-300 underline-offset-2 hover:text-rose-700"
                  >
                    Tra cứu mã số thuế
                  </a>
                )}
              </div>
              {socialItems.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socialItems.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="mb-4 text-sm font-bold text-neutral-800">| Dịch vụ</p>
              <ul className="space-y-2 text-sm text-neutral-700">
                {serviceItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-4 text-sm font-bold text-neutral-800">| Royal Wedding</p>
              <ul className="space-y-2 text-sm text-neutral-700">
                {footerLinks.map((label) => (
                  <li key={label}>
                    {label === "Trang chủ" ? (
                      <Link href="/" className="hover:text-rose-600">
                        {label}
                      </Link>
                    ) : label === "Chăm sóc khách hàng" ? (
                      <Link href="/lien-he" className="hover:text-rose-600">
                        {label}
                      </Link>
                    ) : (
                      <span>{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 py-4">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-xs text-neutral-400">Copyright © 2025 Royal Wedding. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
