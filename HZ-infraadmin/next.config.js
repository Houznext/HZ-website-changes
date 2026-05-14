/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
