/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === '1'
const nextConfig = {
  /** Expose Google OAuth Web Client ID to the browser (GIS / customer Gmail login). Reuses NextAuth’s GOOGLE_CLIENT_ID when NEXT_PUBLIC_* is unset. */
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: (
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      || process.env.GOOGLE_CLIENT_ID
      || ''
    ).trim(),
  },
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' }),
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'houznext.com' },
      { protocol: 'https', hostname: 'your-railway-backend.up.railway.app' },
      // Legacy S3 buckets (keep for existing portal/property images)
      { protocol: 'https', hostname: 'houznext-prod-assets.s3.ap-south-1.amazonaws.com' },
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
        source: '/custom-builder/user/:path*',
        destination: '/livebuild/:path*',
        permanent: true,
      },
      {
        source: '/user/livebuild/:path*',
        destination: '/livebuild/:path*',
        permanent: true,
      },
      { source: '/packages', destination: '/pricing', permanent: true },
      { source: '/packages/:path*', destination: '/pricing', permanent: true },
      { source: '/signup', destination: '/login', permanent: true },
      { source: '/signup/:path*', destination: '/login', permanent: true },
      { source: '/verify-otp', destination: '/login', permanent: true },
      { source: '/verify-otp/:path*', destination: '/login', permanent: true },
      { source: '/forgot-password', destination: '/login', permanent: true },
      { source: '/forgot-password/:path*', destination: '/login', permanent: true },
      { source: '/services', destination: '/interiors', permanent: true },
      { source: '/interiors/kitchen', destination: '/services/modular-kitchen', permanent: true },
      { source: '/commercial-interiors', destination: '/services/commercial-interiors', permanent: true },
      { source: '/portal/login', destination: '/login?callbackUrl=/livebuild/dashboard', permanent: true },
      { source: '/portal/:projectId/documents', destination: '/livebuild/:projectId/documents', permanent: false },
      { source: '/portal/:projectId/designs', destination: '/livebuild/:projectId/documents', permanent: false },
      { source: '/portal/:projectId/gallery', destination: '/livebuild/:projectId/day-progress', permanent: false },
      { source: '/portal/:projectId/reports', destination: '/livebuild/:projectId/day-progress', permanent: false },
      { source: '/portal/:projectId/snags', destination: '/livebuild/:projectId/queries', permanent: false },
      { source: '/portal/:projectId/trades', destination: '/livebuild/:projectId/materials', permanent: false },
      { source: '/portal/:projectId/rewards', destination: '/livebuild/dashboard', permanent: false },
      { source: '/portal/:projectId', destination: '/livebuild/:projectId', permanent: false },
      { source: '/portal/:projectId/:path*', destination: '/livebuild/:projectId', permanent: false },
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
