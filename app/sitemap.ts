import { APP_URL, currentURL } from "@/lib/ProjectId";
import { ApiResponse, SitemapData } from "@/lib/types";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (currentURL || "http://localhost:3000").replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const res = await fetch(`${APP_URL}/api/sitemap`, {
      next: {
        tags: ["sitemap"],
      },
    });

    if (!res.ok) {
      return staticRoutes;
    }

    const json: ApiResponse<SitemapData> = await res.json();
    const data = json?.data;

    const categoryRoutes: MetadataRoute.Sitemap = (data?.categories || []).map(
      (category) => ({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }),
    );

    const articleRoutes: MetadataRoute.Sitemap = (data?.articles || []).map(
      (article) => ({
        url: `${baseUrl}/${article.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    );

    return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
  } catch (error) {
    console.error("Failed to fetch sitemap data:", error);
    return staticRoutes;
  }
}
