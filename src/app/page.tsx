import type { Metadata } from "next";
import { LandingPage } from "@/components/LandingPage";

const title = "Kinesis Lab — Hiểu cơ thể. Dạy tự tin hơn.";
const description =
  "Tra cứu giải phẫu 3D, đọc kiến thức có nguồn và kết nối với bài tập. Không gian học tập và làm việc dành cho Personal Trainer.";
// Self-hosted deployments set SITE_URL to their public origin. Vercel supplies its own.
const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  title: { absolute: title },
  description,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Kinesis Lab",
    title,
    description,
    images: [
      {
        url: "/landing/share.png",
        width: 1200,
        height: 630,
        alt: "Kinesis Lab — giao diện học giải phẫu cơ–xương",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/landing/share.png"],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
