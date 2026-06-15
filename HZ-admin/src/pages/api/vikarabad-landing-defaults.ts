import type { NextApiRequest, NextApiResponse } from "next";

function websiteOrigin() {
  return (process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001").replace(/\/$/, "");
}

/** Proxies Vikarabad landing defaults from HZ-website (single source of truth). */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const origin = websiteOrigin();

  try {
    const upstream = await fetch(`${origin}/api/vikarabad-landing-defaults`, {
      headers: { Accept: "application/json" },
    });
    if (upstream.ok) {
      const data = await upstream.json();
      return res.status(200).json(data);
    }
    console.warn(`[vikarabad-landing-defaults] upstream ${upstream.status} from ${origin}`);
  } catch (err) {
    console.warn("[vikarabad-landing-defaults] proxy failed:", err);
  }

  return res.status(502).json({
    message: `Could not load defaults from ${origin}. Ensure HZ-website is running.`,
  });
}
