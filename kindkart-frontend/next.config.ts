import type { NextConfig } from "next";
import path from "path";

const windowsDistDir = `.next-build-${process.pid}`;
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: isVercel ? ".next" : (process.platform === "win32" ? windowsDistDir : ".next-build"),
  outputFileTracingRoot: path.resolve(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
