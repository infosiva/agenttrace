import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000',
  },
};

export default nextConfig;
