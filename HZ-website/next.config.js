/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'houznext.com' },
      { protocol: 'https', hostname: 'your-railway-backend.up.railway.app' },
      // Legacy S3 buckets (keep for existing portal/property images)
      { protocol: 'https', hostname: 'dreamcasaimages.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'onecasa-dev-assets.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'onecasa-prod-assets.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/custom-builder/user/:id*',
        destination: '/user/custom-builder/user/:id*',
        permanent: false,
      },
      // Houznext blog listing lives at /blog; /blogs was legacy OneCasa listing (CMS). Keep /blogs/:id for API articles.
      { source: '/blogs', destination: '/blog', permanent: true },
      { source: '/blogs/', destination: '/blog', permanent: true },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            minSize: 20000,
            maxSize: 40000,
          },
        },
      }
      config.resolve.alias = {
        ...config.resolve.alias,
        moment$: 'moment/moment.js',
      }
    }
    return config
  },
}

module.exports = nextConfig
