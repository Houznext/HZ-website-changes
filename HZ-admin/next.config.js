/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
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
