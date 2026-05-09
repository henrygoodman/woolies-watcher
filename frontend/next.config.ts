import type { NextConfig } from 'next';
import path from 'path';

const sharedTypesPath = path.resolve(__dirname, 'shared-types');

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL || 'http://backend:5000';
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/backend-api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.woolworths.com.au',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; img-src 'self' https: data:; script-src 'self'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared-types': sharedTypesPath,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      '@shared-types/api': path.resolve(__dirname, 'shared-types/api'),
      '@shared-types/db': path.resolve(__dirname, 'shared-types/db'),
      '@shared-types': sharedTypesPath,
    },
  },
};

export default nextConfig;
