import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000',
    TRACKER_API_URL: process.env.TRACKER_API_URL || 'http://31.97.56.148:3098',
    TRACKER_STATS_KEY: process.env.TRACKER_STATS_KEY || 'sitestats2025',
  },
};

export default nextConfig;
