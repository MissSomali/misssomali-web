import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      "node_modules/prettier/**/*",
      "node_modules/@react-email/components/**/*",
      "node_modules/@react-email/render/**/*",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "prettier": false,
        "@react-email/components": false,
        "@react-email/render": false,
      };
    }
    return config;
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
