import type { NextApiRequest, NextApiResponse } from "next"
import { ADMIN_CITY_LANDING_PAGES } from "@/src/lib/cityLandingRegistry"

function websiteBase() {
  return (process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3001").replace(/\/$/, "")
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const city = typeof req.query.city === "string" ? req.query.city : "vikarabad"
  const valid = ADMIN_CITY_LANDING_PAGES.some((c) => c.slug === city)
  if (!valid) {
    return res.status(400).json({ message: "Invalid city slug" })
  }

  try {
    const upstream = await fetch(`${websiteBase()}/api/city-landing-defaults?city=${city}`)
    if (upstream.ok) {
      return res.status(200).json(await upstream.json())
    }
  } catch {
    /* fall through */
  }

  return res.status(502).json({ message: "Could not load defaults from website" })
}
