let infraBackendUrl = String(
  process.env.INFRA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_INFRA_API_URL ||
    'http://127.0.0.1:4001',
)
  .trim()
  .replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
      { protocol: 'https', hostname: 'onecasa-prod-assets.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'onecasa-dev-assets.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
