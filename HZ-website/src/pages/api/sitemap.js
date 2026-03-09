const BASE_URL = "https://www.onecasa.in";
const API_BASE = process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT;

const CITIES = ["hyderabad", "bangalore", "mumbai", "delhi", "chennai", "pune"];
const CATEGORIES = ["buy", "rent", "flatshare", "plot"];

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

function toSlug(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  const urls = [];
  const today = new Date().toISOString().split("T")[0];

  // ===== STATIC PAGES =====
  urls.push(urlEntry(BASE_URL, { changefreq: "daily", priority: "1.0", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/properties`, { changefreq: "daily", priority: "0.9", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/about-us`, { changefreq: "monthly", priority: "0.6", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/contact-us`, { changefreq: "monthly", priority: "0.6", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/blogs`, { changefreq: "daily", priority: "0.7", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/referandearn`, { changefreq: "monthly", priority: "0.5", lastmod: today }));
  urls.push(urlEntry(`${BASE_URL}/post-property`, { changefreq: "monthly", priority: "0.6", lastmod: today }));

  // ===== CITY x CATEGORY LISTING PAGES =====
  for (const cat of CATEGORIES) {
    for (const city of CITIES) {
      urls.push(
        urlEntry(`${BASE_URL}/properties/${cat}/${city}`, {
          changefreq: "daily",
          priority: "0.9",
          lastmod: today,
        })
      );
    }
  }

  // ===== SERVICE PAGES =====
  const servicePages = [
    { path: "/interiors", priority: "0.85" },
    { path: "/interiors/cost-estimator", priority: "0.7" },
    { path: "/solar", priority: "0.8" },
    { path: "/solar/calculator", priority: "0.7" },
    { path: "/painting", priority: "0.75" },
    { path: "/painting/paint-cost-calculator", priority: "0.7" },
    { path: "/legalservices", priority: "0.75" },
    { path: "/legalservices/packages", priority: "0.65" },
    { path: "/custom-builder", priority: "0.8" },
    { path: "/services/custom-builder", priority: "0.8" },
    { path: "/services/furnitures", priority: "0.75" },
    { path: "/services/furnitures/custom-furnitures", priority: "0.65" },
    { path: "/services/electronics", priority: "0.75" },
    { path: "/services/homedecor", priority: "0.75" },
    { path: "/services/plumbing", priority: "0.7" },
    { path: "/services/loans", priority: "0.7" },
    { path: "/services/vaastu-consultation", priority: "0.7" },
    { path: "/services/packersandmovers", priority: "0.7" },
    { path: "/services/earthmovers", priority: "0.65" },
    { path: "/services/civilEngineering", priority: "0.65" },
    { path: "/services/construction-for-business", priority: "0.65" },
    { path: "/services/invest-in-land", priority: "0.65" },
  ];

  // City-specific service landing URLs for local SEO
  const citySpecificServices = [
    "interiors",
    "solar",
    "painting",
    "legalservices",
    "services/plumbing",
    "services/packersandmovers",
  ];

  for (const svc of servicePages) {
    urls.push(urlEntry(`${BASE_URL}${svc.path}`, { changefreq: "weekly", priority: svc.priority, lastmod: today }));
  }

  // ===== DYNAMIC PROPERTY URLS =====
  try {
    const propertyRes = await fetchJSON(
      `${API_BASE}property/get-all-properties?limit=500&page=1`
    );
    const properties = propertyRes?.data || propertyRes?.body?.data || propertyRes || [];
    const propertyList = Array.isArray(properties) ? properties : [];

    for (const prop of propertyList) {
      if (!prop.isPosted && !prop.isApproved) continue;

      const city = prop.locationDetails?.city || "";
      const name = prop.propertyDetails?.propertyName || "";
      const slug = toSlug(name);
      const category = prop.basicDetails?.lookingType === "Rent" ? "rent" : "buy";
      const citySlug = toSlug(city) || "hyderabad";

      if (!slug || !prop.propertyId) continue;

      const images = prop.mediaDetails?.propertyImages?.slice(0, 3) || [];
      const lastmod = prop.updatedDate || prop.postedDate || today;
      const modDate = typeof lastmod === "string" ? lastmod.split("T")[0] : today;

      urls.push(
        urlEntry(
          `${BASE_URL}/properties/${category}/${citySlug}/details/${slug}?id=${prop.propertyId}&type=property`,
          { changefreq: "weekly", priority: "0.8", lastmod: modDate, images }
        )
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch properties", e);
  }

  // ===== DYNAMIC FURNITURE URLS =====
  try {
    const furnitureRes = await fetchJSON(`${API_BASE}furniture?limit=500`);
    const furnitureList = Array.isArray(furnitureRes) ? furnitureRes : furnitureRes?.data || furnitureRes?.body || [];

    for (const item of (Array.isArray(furnitureList) ? furnitureList : [])) {
      const slug = item.slug || toSlug(item.name);
      if (!slug) continue;
      const cat = toSlug(item.category) || "furniture";
      const images = item.images?.map((img) => typeof img === "string" ? img : img.url).filter(Boolean).slice(0, 3) || [];
      urls.push(
        urlEntry(`${BASE_URL}/services/furnitures/${cat}/${slug}`, {
          changefreq: "weekly",
          priority: "0.7",
          lastmod: today,
          images,
        })
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch furniture", e);
  }

  // ===== DYNAMIC ELECTRONICS URLS =====
  try {
    const electronicsRes = await fetchJSON(`${API_BASE}electronics?limit=500`);
    const electronicsList = Array.isArray(electronicsRes) ? electronicsRes : electronicsRes?.data || electronicsRes?.body || [];

    for (const item of (Array.isArray(electronicsList) ? electronicsList : [])) {
      const slug = item.slug || toSlug(item.name);
      if (!slug) continue;
      const cat = toSlug(item.category) || "electronics";
      urls.push(
        urlEntry(`${BASE_URL}/services/electronics/${cat}/${slug}`, {
          changefreq: "weekly",
          priority: "0.7",
          lastmod: today,
        })
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch electronics", e);
  }

  // ===== DYNAMIC HOME DECOR URLS =====
  try {
    const hdRes = await fetchJSON(`${API_BASE}homeDecor?limit=500`);
    const hdList = Array.isArray(hdRes) ? hdRes : hdRes?.data || hdRes?.body || [];

    for (const item of (Array.isArray(hdList) ? hdList : [])) {
      const slug = item.slug || toSlug(item.name);
      if (!slug) continue;
      const cat = toSlug(item.category) || "homedecor";
      urls.push(
        urlEntry(`${BASE_URL}/services/homedecor/${cat}/${slug}`, {
          changefreq: "weekly",
          priority: "0.7",
          lastmod: today,
        })
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch home decor", e);
  }

  // ===== DYNAMIC BLOG URLS =====
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
