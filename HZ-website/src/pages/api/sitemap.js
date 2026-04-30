const BASE_URL = "https://houznext.com";
const API_BASE = process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, opts = {}) {
  const { lastmod, changefreq = "weekly", priority = "0.5", images = [] } = opts;
  let entry = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) entry += `    <lastmod>${lastmod}</lastmod>\n`;
  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  for (const img of images.slice(0, 5)) {
    entry += `    <image:image>\n      <image:loc>${escapeXml(img)}</image:loc>\n    </image:image>\n`;
  }
  entry += `  </url>`;
  return entry;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  const urls = [];
  const today = new Date().toISOString().split("T")[0];

  // ===== STATIC PAGES =====
  urls.push(urlEntry(BASE_URL, { changefreq: "daily", priority: "1.0", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/about-us`, { changefreq: "monthly", priority: "0.6", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/contact-us`, { changefreq: "monthly", priority: "0.6", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/blog`, { changefreq: "daily", priority: "0.7", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/houznext-rewards`, { changefreq: "monthly", priority: "0.5", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/real-estate`, { changefreq: "weekly", priority: "0.85", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/design-ideas`, { changefreq: "weekly", priority: "0.8", lastmod: today }));

  const marketingPages = [
    { path: "/interiors", priority: "0.85" },
    { path: "/interiors/cost-calculator", priority: "0.7" },
    { path: "/buildlive", priority: "0.85" },
    { path: "/pricing", priority: "0.75" },
  ];

  for (const svc of marketingPages) {
    urls.push(urlEntry(`${BASE_URL}${svc.path}`, { changefreq: "weekly", priority: svc.priority, lastmod: today }));
  }

  // ===== DYNAMIC BLOG URLS (legacy /blogs/{id}) =====
  try {
    const blogRes = await fetchJSON(`${API_BASE}blog`);
    const blogs = Array.isArray(blogRes) ? blogRes : blogRes?.data || blogRes?.body || [];

    for (const blog of (Array.isArray(blogs) ? blogs : [])) {
      const id = blog.id || blog._id;
      if (!id) continue;
      const lastmod = blog.updatedAt || blog.createdAt || today;
      const modDate = typeof lastmod === "string" ? lastmod.split("T")[0] : today;
      const image = blog.coverImage || blog.image;
      urls.push(
        urlEntry(`${BASE_URL}/blogs/${id}`, {
          changefreq: "weekly",
          priority: "0.7",
          lastmod: modDate,
          images: image ? [image] : [],
        })
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch blogs", e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urls.join("\n")}
</urlset>`;

  res.status(200).send(xml);
}
