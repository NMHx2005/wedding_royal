import type { Metadata } from "next";
import { getFaqItems } from "@/lib/data/faq-items";
import { CacCapDoiClient } from "./CacCapDoiClient";

export const metadata: Metadata = {
  title: "Khám phá thiệp cưới tuyệt đẹp từ cộng đồng meWedding",
  description:
    "Thư viện thiệp cưới từ cộng đồng — xem thiệp mẫu do các cặp đôi tạo trên meHappy / meWedding. Mỗi thẻ mở trang thiệp gốc trên nền tảng thiệp.",
};

export default async function CacCapDoiPage() {
  const faqItems = await getFaqItems();
  return <CacCapDoiClient faqItems={faqItems} />;
}
