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
    lng: (vp.southwest.lng + vp.northeast.lng) / 2,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { query, cityPlaceId, city, sessiontoken } = req.query as {
    query?: string;
    cityPlaceId?: string;
    city?: string;
    sessiontoken?: string;
  };

  if (!API_KEY)
    return res.status(500).json({ error: "Missing Google API key" });
  if (!query) return res.status(400).json({ error: "query is required" });
  if (!cityPlaceId && !city)
    return res.status(400).json({ error: "cityPlaceId or city is required" });

  try {
    let center: LatLng | null = null;
    if (cityPlaceId) {
      const det = await axios.get(DETAILS, {
        params: {
          place_id: cityPlaceId,
          key: API_KEY,
          fields: "geometry",
          ...(sessiontoken ? { sessiontoken } : {}),
        },
      });
      const geom = det.data?.result?.geometry;
      center = geom?.location || centerFromViewport(geom?.viewport) || null;
    } else if (city) {
      const geo = await axios.get(GEOCODE, {
        params: {
          address: `${city}, India`,
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
        ...(sessiontoken ? { sessiontoken } : {}),
        ...(center
          ? { location: `${center.lat},${center.lng}`, radius: 40000 }
          : {}),
      },
    });

    const predictions: any[] = ac.data?.predictions || [];

    const cityLower = (city || "").toLowerCase().trim();
    const looksLocality = (types: string[] = []) => {
      const set = new Set(types);
      return (
        set.has("sublocality") ||
        set.has("sublocality_level_1") ||
        set.has("sublocality_level_2") ||
        set.has("neighborhood") ||
        set.has("locality")
      );
    };
    const mentionsCity = (p: any) => {
      if (!cityLower) return true;
      const d = (p.description || "").toLowerCase();
      const sec = (p.structured_formatting?.secondary_text || "").toLowerCase();
      const terms = (p.terms || []).map((t: any) =>
        (t?.value || "").toLowerCase()
      );
      return (
        d.includes(cityLower) ||
        sec.includes(cityLower) ||
        terms.includes(cityLower)
      );
    };

    let filtered = predictions.filter(
      (p) => looksLocality(p.types) && mentionsCity(p)
    );

    if (filtered.length === 0)
      filtered = predictions.filter((p) => looksLocality(p.types));

    const results = await Promise.all(
      filtered.slice(0, 12).map(async (p) => {
        let loc: LatLng | null = null;
        try {
          const det = await axios.get(DETAILS, {
            params: {
              place_id: p.place_id,
              key: API_KEY,
              fields: "geometry",
              ...(sessiontoken ? { sessiontoken } : {}),
            },
          });
          const geom = det.data?.result?.geometry;
          loc = geom?.location || centerFromViewport(geom?.viewport) || null;
        } catch {
          console.log("fetchLocalities error", p.place_id);
        }

        const name =
          p.structured_formatting?.main_text ||
          p.terms?.[0]?.value ||
          p.description;

        return {
          locality: name,
          description: p.description,
          place_id: p.place_id,
          location: loc,
        };
      })
    );

    return res.status(200).json(results);
  } catch (e) {
    console.error("fetchLocalities error", e);
    return res.status(500).json({ error: "Failed to fetch localities" });
  }
}
