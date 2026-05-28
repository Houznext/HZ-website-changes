let infraBackendUrl = String(
  process.env.INFRA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_INFRA_API_URL ||
  'http://127.0.0.1:4001'
)
  .trim()
  .replace(/\/$/, '');

if (!infraBackendUrl) infraBackendUrl = 'http://127.0.0.1:4001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      '',
  },
  async redirects() {
    return [
      { source: '/seen-properties', destination: '/profile?tab=seen', permanent: false },
      { source: '/saved-properties', destination: '/profile?tab=saved', permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/infra-backend/:path*',
        destination: `${infraBackendUrl}/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'houznext-prod-assets.s3.ap-south-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'houznext-dev-assets.s3.ap-south-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'onecasa-prod-assets.s3.ap-south-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'onecasa-dev-assets.s3.ap-south-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
