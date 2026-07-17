import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;