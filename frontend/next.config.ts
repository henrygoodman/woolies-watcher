import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/backend-api/:path*',
        destination: 'http://backend:5000/api/:path*',
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
};

export default nextConfig;
