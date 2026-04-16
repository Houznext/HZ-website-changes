/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === '1'

const nextConfig = {
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
      { source: '/solar', destination: '/', permanent: false },
      { source: '/solar/:path*', destination: '/', permanent: false },
      { source: '/services/solar', destination: '/', permanent: false },
      { source: '/legalservices', destination: '/', permanent: false },
      { source: '/legalservices/:path*', destination: '/', permanent: false },
      { source: '/earthmovers', destination: '/', permanent: false },
      { source: '/earthmovers/:path*', destination: '/', permanent: false },
      { source: '/services/earthmovers', destination: '/', permanent: false },
      { source: '/painting', destination: '/', permanent: false },
      { source: '/painting/:path*', destination: '/', permanent: false },
      { source: '/services/painting', destination: '/', permanent: false },
      { source: '/plumbing', destination: '/', permanent: false },
      { source: '/plumbing/:path*', destination: '/', permanent: false },
      { source: '/services/plumbing', destination: '/', permanent: false },
      { source: '/packersandmovers', destination: '/', permanent: false },
      { source: '/packersandmovers/:path*', destination: '/', permanent: false },
      { source: '/loans', destination: '/', permanent: false },
      { source: '/loans/:path*', destination: '/', permanent: false },
      { source: '/services/loans', destination: '/', permanent: false },
      { source: '/services/homedecor', destination: '/', permanent: false },
      { source: '/services/homedecor/:path*', destination: '/', permanent: false },
      { source: '/services/electronics', destination: '/', permanent: false },
      { source: '/services/electronics/:path*', destination: '/', permanent: false },
      { source: '/services/vastu-consultation', destination: '/', permanent: false },
      { source: '/services/civilEngineering', destination: '/', permanent: false },
      { source: '/services/custom-builder', destination: '/livebuild', permanent: true },
      { source: '/services/custom-builder/:path*', destination: '/livebuild', permanent: true },
      { source: '/custom-builder', destination: '/livebuild', permanent: true },
      { source: '/custom-builder/:path*', destination: '/livebuild', permanent: true },
      { source: '/referandearn', destination: '/houznext-rewards', permanent: true },
      { source: '/view-analytics', destination: '/', permanent: false },
      {
        source: '/custom-builder/user/:id*',
        destination: '/user/livebuild/user/:id*',
        permanent: false,
      },
      // Houznext blog listing lives at /blog; /blogs was legacy OneCasa listing (CMS). Keep /blogs/:id for API articles.
      { source: '/blogs', destination: '/blog', permanent: true },
      { source: '/blogs/', destination: '/blog', permanent: true },
      { source: '/services/construction-for-business', destination: '/', permanent: false },
      { source: '/services/construction-for-business/:path*', destination: '/', permanent: false },
      { source: '/services/invest-in-land', destination: '/', permanent: false },
      { source: '/services/invest-in-land/:path*', destination: '/', permanent: false },
      { source: '/gallery', destination: '/', permanent: false },
      { source: '/gallery/:path*', destination: '/', permanent: false },
      { source: '/propshome', destination: '/real-estate', permanent: true },
      { source: '/propshome/:path*', destination: '/real-estate', permanent: true },
      { source: '/projects', destination: '/', permanent: false },
      { source: '/projects/:path*', destination: '/', permanent: false },
      { source: '/recentproperties', destination: '/real-estate', permanent: true },
      { source: '/recentproperties/:path*', destination: '/real-estate', permanent: true },
      { source: '/emicalculator', destination: '/', permanent: false },
      { source: '/ga4dashboard', destination: '/', permanent: false },
      { source: '/ga4dashboard/:path*', destination: '/', permanent: false },
      { source: '/user/axis-control', destination: '/user/dashboard', permanent: false },
      { source: '/user/referralprogress', destination: '/user/houznext-rewards-progress', permanent: true },
      { source: '/user/referralprogress/:path*', destination: '/user/houznext-rewards-progress', permanent: true },
      { source: '/packages', destination: '/pricing', permanent: true },
      { source: '/packages/:path*', destination: '/pricing', permanent: true },
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
