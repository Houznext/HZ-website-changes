// pages/api/fetchSublocalities.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const AUTOCOMPLETE =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";
const GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json";
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

type LatLng = { lat: number; lng: number };
function centerFromViewport(vp?: {
  northeast?: LatLng;
  southwest?: LatLng;
}): LatLng | null {
  if (!vp?.northeast || !vp?.southwest) return null;
  return {
    lat: (vp.northeast.lat + vp.southwest.lat) / 2,
    lng: (vp.northeast.lng + vp.southwest.lng) / 2,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { query, localityPlaceId, locality, city } = req.query as {
    query?: string;
    localityPlaceId?: string;
    locality?: string;
    city?: string;
  };

  if (!API_KEY)
    return res.status(500).json({ error: "Missing Google API key" });
  if (!query) return res.status(400).json({ error: "query is required" });
  if (!localityPlaceId && !locality)
    return res
      .status(400)
      .json({ error: "localityPlaceId or locality is required" });

  try {
    let center: LatLng | null = null;
    if (localityPlaceId) {
      const det = await axios.get(DETAILS, {
        params: {
          place_id: localityPlaceId,
          key: API_KEY,
          fields: "geometry",
        },
      });
      const geom = det.data?.result?.geometry;
      center = geom?.location || centerFromViewport(geom?.viewport) || null;
    } else if (locality) {
      const geo = await axios.get(GEOCODE, {
        params: {
          address: `${locality}${city ? `, ${city}` : ""}, India`,
          components: "country:IN",
          key: API_KEY,
        },
      });
      const r = geo.data?.results?.[0];
      const geom = r?.geometry;
      center = geom?.location || centerFromViewport(geom?.viewport) || null;
    }

    const ac = await axios.get(AUTOCOMPLETE, {
      params: {
        input: String(query),
        types: "geocode",
        components: "country:in",
        region: "in",
        key: API_KEY,
        ...(center
          ? { location: `${center.lat},${center.lng}`, radius: 20000 }
          : {}),
      },
    });

    const predictions: any[] = ac.data?.predictions || [];
    const localityLower = (locality || "").toLowerCase().trim();

    const looksSubLocality = (types: string[] = []) => {
      const set = new Set(types);
      return (
        set.has("sublocality") ||
        set.has("sublocality_level_1") ||
        set.has("sublocality_level_2") ||
        set.has("neighborhood")
      );
    };

    const mentionsLocality = (p: any) => {
      if (!localityLower) return true;
      const d = (p.description || "").toLowerCase();
      const sec = (p.structured_formatting?.secondary_text || "").toLowerCase();
      const terms = (p.terms || []).map((t: any) =>
        (t?.value || "").toLowerCase()
      );
      return (
        d.includes(localityLower) ||
        sec.includes(localityLower) ||
        terms.includes(localityLower)
      );
    };

    let filtered = predictions.filter(
      (p) => looksSubLocality(p.types) && mentionsLocality(p)
    );
    if (filtered.length === 0)
      filtered = predictions.filter((p) => looksSubLocality(p.types));

    const results = await Promise.all(
      filtered.slice(0, 12).map(async (p) => {
        let loc: LatLng | null = null;
        try {
          const det = await axios.get(DETAILS, {
            params: {
              place_id: p.place_id,
              key: API_KEY,
              fields: "geometry",
            },
          });
          const geom = det.data?.result?.geometry;
          loc = geom?.location || centerFromViewport(geom?.viewport) || null;
        } catch {}
        return {
          subLocality:
            p.structured_formatting?.main_text ||
            p.terms?.[0]?.value ||
            p.description,
          description: p.description,
          place_id: p.place_id,
          location: loc,
        };
      })
    );

    return res.status(200).json(results);
  } catch (e) {
    console.error("fetchSublocalities error", e);
    return res.status(500).json({ error: "Failed to fetch sublocalities" });
  }
}
