import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        fallback: [
          {
            source: "/api/:path*",
            destination:
              "https://api-cema-backend-grdzhqgzd4gufwgg.southeastasia-01.azurewebsites.net/api/:path*",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
