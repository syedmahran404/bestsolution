import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/** PWA web app manifest (App Router convention). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0f1a",
    theme_color: "#7c5cfc",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
