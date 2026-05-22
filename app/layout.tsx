import type { Metadata } from "next";
import { Great_Vibes, Noto_Sans, Oswald, Quicksand, Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import { AppProviders } from "@/components/providers/AppProviders";
import { SITE_NAME } from "@/lib/brand";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin", "vietnamese"],
  variable: "--font-great-vibes",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE_NAME} — Thiệp cưới điện tử`,
  description: `${SITE_NAME} — Thiệp cưới điện tử đẹp, hiện đại`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${notoSans.variable} ${greatVibes.variable} ${sourceSans.variable} ${oswald.variable} ${quicksand.variable}`}
    >
      <body className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
        <AppProviders>{children}</AppProviders>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
