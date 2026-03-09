// pages/api/fetchCity.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const AUTOCOMPLETE =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

  const { query } = req.query as {
    query?: string;
  };
  if (!query) return res.status(400).json({ error: "Query is required" });
  if (!API_KEY)
    return res.status(500).json({ error: "Missing Google API key" });

  try {
    const ac = await axios.get(AUTOCOMPLETE, {
      params: {
        input: query,
        types: "(regions)",
        components: "country:in",
        region: "in",
        key: API_KEY,
      },
    });

    const predictions: any[] = (ac.data?.predictions || []).filter((p: any) => {
      const t: string[] = p.types || [];
      const isCityLike =
        t.includes("locality") ||
        t.includes("administrative_area_level_2") ||
        t.includes("administrative_area_level_3") ||
        t.includes("colloquial_area");
      const notCountry = !t.includes("country");
      return isCityLike && notCountry;
    });

    const results = await Promise.all(
      predictions.slice(0, 8).map(async (p) => {
        // Fallback city/state from terms
        const terms = p.terms || [];
        const city = terms[0]?.value || p.description;

        // If the last term is "India", prefer the previous as state; else use last term
        let fallbackState = "";
        if (terms.length >= 2) {
          const last = terms[terms.length - 1]?.value?.toLowerCase?.() || "";
          fallbackState =
            last === "india"
              ? terms[terms.length - 2]?.value || ""
              : terms[terms.length - 1]?.value || "";
        }

        // Enrich with geometry and authoritative state from address_components
        let location: LatLng | null = null;
        let state = fallbackState;
        try {
          const det = await axios.get(DETAILS, {
            params: {
              place_id: p.place_id,
              key: API_KEY,
              fields: "geometry,address_components",
            },
          });

          const geom = det.data?.result?.geometry;
          location =
            geom?.location || centerFromViewport(geom?.viewport) || null;

          const comps: any[] = det.data?.result?.address_components || [];
          const stateComp =
            comps.find((c) =>
              (c.types || []).includes("administrative_area_level_1")
            ) || null;

          if (stateComp?.long_name || stateComp?.short_name) {
            state = stateComp.long_name || stateComp.short_name;
          }
        } catch {
          console.log("Failed to fetch details for", p.place_id);
        }

        return {
          city,
          state,
          description: p.description,
          place_id: p.place_id,
          location,
        };
      })
    );

    res.status(200).json(results);
  } catch (e) {
    console.error("fetchCity error", e);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
}
