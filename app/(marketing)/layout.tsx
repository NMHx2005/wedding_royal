import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingNavbar } from "@/components/landing/MarketingNavbar";
import { MarketingFooter } from "@/components/landing/MarketingFooter";
import { getWebsiteSetting } from "@/lib/settings/get-website-setting";
import type { SeoSettings } from "@/types";

const DEFAULT_SEO: SeoSettings = {
  title:
    "Royal Wedding — Thiệp cưới online & điện tử | Mời cưới thời 5.0",
  description:
    "Nền tảng tạo thiệp cưới online với gói Basic, Pro, VIP — mẫu hiện đại, RSVP, lời chúc và thanh toán PayOS. Mời cưới thời 5.0 cho đám cưới của bạn.",
  og_image: "https://mehappy.vn/images/logo-mehappy.png",
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getWebsiteSetting<SeoSettings>("seo", DEFAULT_SEO);
  return {
    title: seo.title || DEFAULT_SEO.title,
    description: seo.description || DEFAULT_SEO.description,
    openGraph: {
      title: seo.title || DEFAULT_SEO.title,
      description: seo.description || DEFAULT_SEO.description,
      images: seo.og_image ? [{ url: seo.og_image }] : [{ url: DEFAULT_SEO.og_image! }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title || DEFAULT_SEO.title,
      description: seo.description || DEFAULT_SEO.description,
      images: seo.og_image ? [seo.og_image] : [DEFAULT_SEO.og_image!],
    },
  };
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNavbar />
      {children}
      <MarketingFooter />
    </div>
  );
}
