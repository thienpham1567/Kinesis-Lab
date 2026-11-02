import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, IBM_Plex_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { THEME_BOOT } from "@/lib/theme";
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
  metadataBase: new URL("https://kinesis-lab.vercel.app"),
  title: {
    default: "Kinesis Lab — Giải phẫu, Cơ sinh học & Lâm sàng cho PT",
    template: "%s | Kinesis Lab",
  },
  description:
    "Nền tảng tra cứu giải phẫu cơ – khớp OpenStax, cơ sinh học phì đại cơ, sàng lọc cờ đỏ PAR-Q+, phân tích xét nghiệm & y văn PubMed dành cho Personal Trainer.",
  applicationName: "Kinesis Lab",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Kinesis Lab",
    title: "Kinesis Lab — Giải phẫu, Cơ sinh học & Lâm sàng cho PT",
    description:
      "Nền tảng tra cứu giải phẫu cơ – khớp OpenStax, cơ sinh học phì đại cơ, sàng lọc cờ đỏ PAR-Q+, phân tích xét nghiệm & y văn PubMed dành cho Personal Trainer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinesis Lab — Giải phẫu, Cơ sinh học & Lâm sàng cho PT",
    description:
      "Nền tảng tra cứu giải phẫu cơ – khớp OpenStax, cơ sinh học phì đại cơ, sàng lọc cờ đỏ PAR-Q+, phân tích xét nghiệm & y văn PubMed dành cho Personal Trainer.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#efe9e3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-theme="linen"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${labFont.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-full bg-canvas text-ink antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
