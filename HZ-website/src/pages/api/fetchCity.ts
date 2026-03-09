// pages/api/fetchCity.ts
import type { NextApiRequest, NextApiResponse } from "next";

const AUTOCOMPLETE =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS = "https://maps.googleapis.com/maps/api/place/details/json";
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

type LatLng = { lat: number; lng: number };

const centerFromViewport = (vp?: {
  northeast?: LatLng;
  southwest?: LatLng;
}): LatLng | null => {
  if (!vp?.northeast || !vp?.southwest) return null;
  return {
    lat: (vp.northeast.lat + vp.southwest.lat) / 2,
    lng: (vp.northeast.lng + vp.southwest.lng) / 2,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { query, sessiontoken } = req.query as {
    query?: string;
    sessiontoken?: string;
  };
  if (!query?.trim())
    return res.status(400).json({ error: "Query is required" });
  if (!API_KEY)
    return res.status(500).json({ error: "Missing Google API key" });

  try {
    // --- Autocomplete ---
    const acUrl = new URL(AUTOCOMPLETE);
    acUrl.searchParams.set("input", query.trim());
    // (cities) works better than (regions) to force locality-like results
    acUrl.searchParams.set("types", "(cities)");
    acUrl.searchParams.set("components", "country:in");
    acUrl.searchParams.set("language", "en-IN");
    acUrl.searchParams.set("key", API_KEY);
    if (sessiontoken) acUrl.searchParams.set("sessiontoken", sessiontoken);

    const acResp = await fetch(acUrl.toString());
    if (!acResp.ok) {
      return res
        .status(acResp.status)
        .json({ error: `Autocomplete HTTP ${acResp.status}` });
    }
    const acData = await acResp.json();

    // Google returns 200 with a "status" field
    if (acData.status && acData.status !== "OK") {
      const code =
        acData.status === "ZERO_RESULTS"
          ? 200
          : acData.status === "OVER_QUERY_LIMIT"
          ? 429
          : 502;
      return res.status(code).json({
        error: `Autocomplete ${acData.status}`,
        details: acData.error_message,
      });
    }

    const predictions: any[] = Array.isArray(acData?.predictions)
      ? acData.predictions
      : [];

    const cityPreds = predictions
      .filter((p: any) => {
        const t: string[] = p.types || [];
        const isCityLike =
          t.includes("locality") ||
          t.includes("administrative_area_level_2") ||
          t.includes("administrative_area_level_3") ||
          t.includes("colloquial_area");
        const notCountry = !t.includes("country");
        return isCityLike && notCountry;
      })
      .slice(0, 8);

    const toUse = cityPreds.length ? cityPreds : predictions.slice(0, 5);

    // --- Enrich each with Details (geometry + state) ---
    const enriched = await Promise.all(
      toUse.map(async (p: any) => {
        // Fallbacks from terms
        const terms = p.terms || [];
        const fallbackCity = terms[0]?.value || p.description || "";
        let fallbackState = "";
        if (terms.length >= 2) {
          const last = (terms[terms.length - 1]?.value || "").toLowerCase();
          fallbackState =
            last === "india"
              ? terms[terms.length - 2]?.value || ""
              : terms[terms.length - 1]?.value || "";
        }

        let location: LatLng | null = null;
        let state = fallbackState;

        try {
          const detUrl = new URL(DETAILS);
          detUrl.searchParams.set("place_id", p.place_id);
          detUrl.searchParams.set(
            "fields",
            "geometry,address_components,types,name"
          );
          detUrl.searchParams.set("key", API_KEY);
          if (sessiontoken)
            detUrl.searchParams.set("sessiontoken", sessiontoken);

          const detResp = await fetch(detUrl.toString());
          if (detResp.ok) {
            const detData = await detResp.json();
            const geom = detData?.result?.geometry;
            location =
              geom?.location || centerFromViewport(geom?.viewport) || null;

            const comps: any[] = detData?.result?.address_components || [];
            const stateComp = comps.find((c: any) =>
              (c.types || []).includes("administrative_area_level_1")
            );
            if (stateComp?.long_name || stateComp?.short_name) {
              state = stateComp.long_name || stateComp.short_name;
            }
          }
        } catch (_) {
          // ignore
          console.log("Failed to fetch details for", p.place_id);
        }

        return {
          city: fallbackCity,
          state,
          description: p.description,
          place_id: p.place_id,
          location,
        };
      })
    );

    return res.status(200).json(enriched);
  } catch (e: any) {
    console.error("fetchCity error", e?.response?.data || e);
    return res.status(500).json({ error: "Failed to fetch cities" });
  }
}
