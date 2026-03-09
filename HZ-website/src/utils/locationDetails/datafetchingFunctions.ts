import axios from "axios";

const axiosClient = axios.create({ baseURL: "/api" });

export type LatLng = { lat: number; lng: number };
export type LatLngStr = { lat: string; lng: string };

export type CitySuggestion = {
  city: string;
  state?: string;
  description?: string;
  place_id: string;
  location?: LatLng;
};

export type LocalitySuggestion = {
  locality: string;
  description?: string;
  place_id: string;
  location?: LatLng;
};

export type SubLocalitySuggestion = {
  subLocality: string;
  description?: string;
  place_id?: string;
};

export type NearbyPhoto = {
  place_name: string;
  photo_url: string;
};

export type NearbyResponse = {
  places: any[];
  photos: NearbyPhoto[];
};

let sessionToken =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : undefined;
let inFlight: AbortController | null = null;

// ---- Utilities
export const createImageUrl = (photo_reference: string, maxwidth = 400) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photo_reference}&key=${key}`;
};

const fetchCity = async (query: string) => {
  // Abort previous request
  if (inFlight) inFlight.abort();
  inFlight = new AbortController();

  try {
    const { data } = await axiosClient.get("/fetchCity", {
      params: { query, sessiontoken: sessionToken },
      signal: inFlight.signal,
    });
    return data ?? [];
  } catch (e: any) {
    // Swallow cancels (common during fast typing)
    if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return [];
    console.error("Error fetching city:", e);
    return [];
  } finally {
    inFlight = null;
  }
};

const fetchLocalities = async (
  params: {
    query: string;
    cityPlaceId: string;
    city: string;
  },
  signal?: AbortSignal
) => {
  try {
    const { data } = await axiosClient.get(`/fetchLocalities`, {
      params,
      signal,
    });
    return data as LocalitySuggestion[];
  } catch (error) {
    console.error("Error fetching localities:", error);
    return null;
  }
};

const fetchSublocalities = async (
  params: {
    query: string;
    localityPlaceId: string;
    locality: string;
  },
  signal?: AbortSignal
) => {
  try {
    const { data } = await axiosClient.get(`/fetchSublocalities`, {
      params,
      signal,
    });
    return data as SubLocalitySuggestion[];
  } catch (error) {
    console.error("Error fetching sublocalities:", error);
    return null;
  }
};

// Apartments (bring back)
const fetchApartments = async (locality: string, city: string) => {
  try {
    const { data } = await axiosClient.get(`/fetchApartments`, {
      params: { locality, city },
    });
    return data;
  } catch (error) {
    console.error("Error fetching apartments:", error);
    return null;
  }
};

// Home page city – in-memory cache to avoid repeated API calls (cost + performance)
let homePageCityCache: { key: string; value: { city?: string | null }; at: number } = { key: "", value: {}, at: 0 };
const HOME_PAGE_CITY_TTL_MS = 10 * 60 * 1000; // 10 minutes

const fetchHomePageCity = async (
  lat: string | number,
  lng: string | number
): Promise<{ city?: string | null } | null> => {
  const latR = Number(lat).toFixed(4);
  const lngR = Number(lng).toFixed(4);
  const key = `${latR},${lngR}`;
  const now = Date.now();
  if (homePageCityCache.key === key && now - homePageCityCache.at < HOME_PAGE_CITY_TTL_MS) {
    return homePageCityCache.value;
  }
  try {
    const { data } = await axiosClient.get(`/fetchHomePageCity`, {
      params: { lat, lng },
    });
    const result = data ?? null;
    if (result && typeof result === "object") {
      homePageCityCache = { key, value: result, at: now };
    }
    return result;
  } catch (error) {
    console.error("Error fetching home page city:", error);
    return null;
  }
};

// Reverse geocode current coordinates
export const getCurrentAddress = async (lat: number, lng: number) => {
  try {
    const { data } = await axiosClient.get(`/current-location`, {
      params: { lat, lng },
    });
    return data;
  } catch (error) {
    console.error("Error fetching current address:", error);
    return null;
  }
};

// Location details from place_id. Returns null if place_id is missing or request fails.
const getLocationDetails = async (place_id: string | undefined | null) => {
  if (!place_id?.trim()) return null;
  try {
    const { data } = await axiosClient.get("/location-details", {
      params: { place_id },
    });
    return data;
  } catch (error) {
    console.error("Error fetching location details:", error);
    return null;
  }
};

const fetchNearbyLocations = async ({
  latitude,
  longitude,
  radiusMeters = 5000,
  types = [],
  signal,
}: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  types?: string[];
  signal?: AbortSignal;
}): Promise<NearbyResponse> => {
  try {
    const { data } = await axiosClient.get("/fetchNearbyLocations", {
      params: {
        lat: latitude,
        lng: longitude,
        radius: radiusMeters,
        types: (types || []).join(","),
      },
      signal,
    });
    return (data ?? { places: [], photos: [] }) as NearbyResponse;
  } catch (err) {
    console.error("Error fetching nearby locations:", err);
    return { places: [], photos: [] };
  }
};

export {
  fetchCity,
  fetchLocalities,
  fetchSublocalities,
  fetchApartments,
  fetchHomePageCity,
  getLocationDetails,
  fetchNearbyLocations,
};
