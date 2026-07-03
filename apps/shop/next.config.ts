import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@diana-mile/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
