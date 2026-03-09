// pages/api/fetchNearbyLocations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { createImageUrl } from "@/utils/locationDetails/datafetchingFunctions";

const GOOGLE_NEARBY_SEARCH_API =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

type NearbyPhoto = { place_name: string; photo_url: string };
type NearbyResponse = {
  places?: any[];
  photos?: NearbyPhoto[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NearbyResponse>
) {
  try {
    if (!API_KEY) throw new Error("Missing Google Places API Key");

    const { lat, lng, radius, types } = req.query;

    // normalize params
    const latitude = Array.isArray(lat) ? lat[0] : lat;
    const longitude = Array.isArray(lng) ? lng[0] : lng;
    const radiusMeters =
      Number(Array.isArray(radius) ? radius[0] : radius) || 5000;

    // Comma-separated -> array -> pipe-joined keyword string
    const typesCsv = Array.isArray(types)
      ? types[0]
      : (types as string | undefined);
    const keyword =
      (
        typesCsv
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || []
      ).join("|") || undefined;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    // Build params. We use `type=point_of_interest` and a `keyword` to filter multiple categories.
    const params: Record<string, string | number | undefined> = {
      location: `${latitude},${longitude}`,
      radius: radiusMeters,
      key: API_KEY,
      type: "point_of_interest",
      keyword,
    };

    const response = await axios.get(GOOGLE_NEARBY_SEARCH_API, { params });
    const data = response.data;

    const places = Array.isArray(data?.results) ? data.results : [];

    const photos: NearbyPhoto[] = [];
    for (const place of places) {
      const name: string = place?.name || "Unknown Place";
      const placePhotos: any[] = place?.photos || [];
      for (const p of placePhotos) {
        if (!p?.photo_reference) continue;
        photos.push({
          place_name: name,
          photo_url: createImageUrl(p.photo_reference),
        });
      }
    }

    const seen = new Set<string>();
    const deduped = photos.filter((p) => {
      if (seen.has(p.photo_url)) return false;
      seen.add(p.photo_url);
      return true;
    });

    return res.status(200).json({ places, photos: deduped });
  } catch (err) {
    console.error("API route error (/fetchNearbyLocations):", err);
    return res.status(500).json({
      error: "Failed to fetch nearby locations",
      places: [],
      photos: [],
    });
  }
}
