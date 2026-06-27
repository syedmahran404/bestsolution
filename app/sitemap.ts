import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/** Sitemap for the public routes (App Router convention). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/report", "/reports", "/admin", "/admin/cases"];
  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
