import type { NextConfig } from "next";
import path from "path";

const windowsDistDir = `.next-build-${process.pid}`;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.platform === "win32" ? windowsDistDir : ".next-build",
  outputFileTracingRoot: path.resolve(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
