import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-images.ifood.com.br",
      },
      {
        protocol: "https",
        hostname: "instadelivery-public.nyc3.cdn.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
