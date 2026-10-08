import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL!

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",

      disallow: [
        "/admin/",
        "/login/",
        "/register/",
        "/profile/",
        "/bookmarks/",
        "/api/",
      ],
    },

    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}