import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: ['@prismora/ui', '@prismora/simulation-core'],
};

export default nextConfig;
