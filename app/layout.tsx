// app/layout.tsx
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { APP_URL, currentURL } from "@/lib/ProjectId";
import { Analytics } from "@vercel/analytics/next";
import { SiteSettings } from "@/lib/types";

const cairoFont = Cairo({
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  subsets: ["arabic"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${APP_URL}/api/settings`, {
      next: {
        tags: ["metadata"],
      },
      cache: "force-cache",
    });

    if (!res.ok) throw new Error("Failed to fetch settings");

    const json = await res.json();
    const data: SiteSettings = json.data;

    const title = data.metaTitle || data.projectName;
    const description = data.metaDescription;
    const brandName = data.projectName;
    const keywords = data.metaKeywords
      ? data.metaKeywords.split(",").map((k: string) => k.trim())
      : [brandName];

    return {
      metadataBase: new URL(currentURL ?? "http://localhost:3000"),
      title,
      description,
      keywords,
      creator: brandName,
      publisher: brandName,
      openGraph: {
        title,
        description,
        type: "website",
        locale: "ar_SA",
        siteName: brandName,
        images: data.logo ? [{ url: data.logo }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      alternates: {
        canonical: currentURL,
      },
    };
  } catch (error) {
    console.error("Metadata fetch failed:", error);
    return {
      title: "الرؤية",
      description: "موقع إخباري عربي",
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairoFont.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
