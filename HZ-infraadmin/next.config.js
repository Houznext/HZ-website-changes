/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'houznext-prod-assets.s3.ap-south-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'houznext-dev-assets.s3.ap-south-1.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
