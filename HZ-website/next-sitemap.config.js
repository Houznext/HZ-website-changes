/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://houznext.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/login', '/portal/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/login', '/portal/', '/api/'] },
    ],
    additionalSitemaps: [],
  },
  additionalPaths: async () => [
    { loc: '/',            changefreq: 'weekly',  priority: 1.0 },
    { loc: '/interiors',   changefreq: 'weekly',  priority: 0.9 },
    { loc: '/pricing',     changefreq: 'monthly', priority: 0.9 },
    { loc: '/real-estate', changefreq: 'weekly',  priority: 0.8 },
    { loc: '/buildlive',   changefreq: 'monthly', priority: 0.7 },
    { loc: '/blog',        changefreq: 'daily',   priority: 0.8 },
  ],
}
