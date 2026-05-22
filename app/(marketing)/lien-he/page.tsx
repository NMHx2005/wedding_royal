import type { Metadata } from "next";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { ContactSettings, SocialSettings } from "@/types";
import { LienHeClient } from "./LienHeClient";

export const metadata: Metadata = {
  title: "Liên hệ — Royal Wedding",
  description:
    "Liên hệ Royal Wedding — hỗ trợ tạo thiệp cưới online, tư vấn gói dịch vụ và chăm sóc khách hàng 24/7.",
};

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

export default async function LienHePage() {
  const supabase = createPublicSupabase();
  const { data: settings } = await supabase
    .from("website_settings")
    .select("key, value")
    .in("key", ["contact", "social"]);

  const contactRow = settings?.find((s) => s.key === "contact");
  const socialRow = settings?.find((s) => s.key === "social");

  const contact: ContactSettings = contactRow
    ? { ...DEFAULT_CONTACT, ...(contactRow.value as Partial<ContactSettings>) }
    : DEFAULT_CONTACT;

  const social: SocialSettings = socialRow
    ? { ...DEFAULT_SOCIAL, ...(socialRow.value as Partial<SocialSettings>) }
    : DEFAULT_SOCIAL;

  return <LienHeClient contact={contact} social={social} />;
}
