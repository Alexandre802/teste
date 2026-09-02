import type { MetadataRoute } from "next";

import { restaurant } from "@/data/restaurant";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${restaurant.siteUrl}/sitemap.xml`,
  };
}
