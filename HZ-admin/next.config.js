/**
 * API used when proxying (browser → Next → Nest). Resolves in order:
 * BACKEND_REWRITE_URL (e.g. production internal URL) → public API env → local dev
 *
 * If dev logs show "Failed to proxy" / ECONNREFUSED to port 4000, start the Nest
 * app: `cd HZ-backend && npm run start:dev` (or set the env vars above to your API URL).
 */
const backendRewriteBase = (
  process.env.BACKEND_REWRITE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
  "http://127.0.0.1:4000"
).replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/hz-backend/:path*",
        destination: `${backendRewriteBase}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/solar", destination: "/dashboard", permanent: false },
      { source: "/solar/:path*", destination: "/dashboard", permanent: false },
      { source: "/legal-services", destination: "/dashboard", permanent: false },
      { source: "/legal-services/:path*", destination: "/dashboard", permanent: false },
      { source: "/electronics", destination: "/dashboard", permanent: false },
      { source: "/electronics/:path*", destination: "/dashboard", permanent: false },
      { source: "/home-decors", destination: "/dashboard", permanent: false },
      { source: "/home-decors/:path*", destination: "/dashboard", permanent: false },
      { source: "/human-resource", destination: "/dashboard", permanent: false },
      { source: "/human-resource/:path*", destination: "/dashboard", permanent: false },
      { source: "/attendance", destination: "/dashboard", permanent: false },
      { source: "/attendance/:path*", destination: "/dashboard", permanent: false },
      { source: "/serviceleads", destination: "/dashboard", permanent: false },
      { source: "/serviceleads/:path*", destination: "/dashboard", permanent: false },
      { source: "/custom-builder", destination: "/livebuild", permanent: true },
      { source: "/custom-builder/:path*", destination: "/livebuild/:path*", permanent: true },
      { source: "/referandearn", destination: "/houznext-rewards", permanent: true },
      { source: "/referandearn/:path*", destination: "/houznext-rewards/:path*", permanent: true },
      { source: "/settings/attendance-management", destination: "/settings", permanent: false },
      { source: "/settings/attendance-management/:path*", destination: "/settings", permanent: false },
      { source: "/livebuild/packages", destination: "/livebuild", permanent: false },
      { source: "/livebuild/packages/:path*", destination: "/livebuild", permanent: false },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "onecasa-dev-assets.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "onecasa-prod-assets.s3.ap-south-1.amazonaws.com",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

module.exports = nextConfig;
