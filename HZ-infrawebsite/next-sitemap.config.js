/** @type {import('next-sitemap').IConfig} */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://infra.houznext.com').replace(
  /\/$/,
  '',
);

module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/api/*',
    '/login',
    '/profile',
    '/saved-properties',
    '/seen-properties',
    '/server-sitemap.xml',
  ],
  transform: async (config, path) => {
    if (path === '/' || path === '') {
      return {
        loc: `${SITE_URL}/`,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }
    return config;
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api'] },
    ],
    additionalSitemaps: [`${SITE_URL}/server-sitemap.xml`],
  },
};
