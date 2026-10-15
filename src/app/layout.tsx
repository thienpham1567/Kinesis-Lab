import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const labFont = IBM_Plex_Mono({
  variable: "--font-lab",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Kinesis Lab — Giải phẫu, Cơ sinh học & Lâm sàng cho PT",
    template: "%s | Kinesis Lab",
  },
  description:
    "Nền tảng tra cứu giải phẫu cơ – khớp OpenStax, cơ sinh học phì đại cơ, sàng lọc cờ đỏ PAR-Q+, phân tích xét nghiệm & y văn PubMed dành cho Personal Trainer.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eef1ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${bodyFont.variable} ${labFont.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
