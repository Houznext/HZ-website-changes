import axios from "axios";

const axiosClient = axios.create({ baseURL: "/api" });

// Accept number or string coords in admin
export type LatLng = { lat: number | string; lng: number | string };

export type CitySuggestion = {
  city: string;
  state?: string;
  description?: string;
  place_id: string;
  location?: LatLng | null;
};

export type LocalitySuggestion = {
  locality: string;
  description?: string;
  place_id: string;
  location?: LatLng | null;
};

export type SubLocalitySuggestion = {
  subLocality: string;
  description?: string;
  place_id?: string;
  location?: LatLng | null;
};

export type NearbyPhoto = { place_name: string; photo_url: string };
export type NearbyResponse = { places: any[]; photos: NearbyPhoto[] };

export type ReverseGeocodeResult = {
  city?: string;
  state?: string;
  locality?: string;
  subLocality?: string;
  city_place_id?: string;
  locality_place_id?: string;
  city_location?: LatLng;
  locality_location?: LatLng;
  street?: string;
  zipCode?: string | number;
  formattedAddress?: string;
};

const isAbort = (err: unknown) =>
  // @ts-ignore
  err?.name === "CanceledError" || err?.name === "AbortError";

export const createImageUrl = (photo_reference: string, maxwidth = 400) => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photo_reference}&key=${key}`;
};

export const fetchCity = async (
  query: string,
  signal?: AbortSignal
): Promise<CitySuggestion[] | null> => {
  try {
    const { data } = await axiosClient.get<CitySuggestion[]>("/fetchCity", {
      params: { query },
      signal,
    });
    return data || [];
  } catch (error) {
    if (!isAbort(error)) console.error("Error fetching city:", error);
    return null;
  }
};

export const fetchLocalities = async (
  params: { query: string; cityPlaceId?: string; city?: string },
  signal?: AbortSignal
): Promise<LocalitySuggestion[] | null> => {
  try {
    const { data } = await axiosClient.get<LocalitySuggestion[]>(
      "/fetchLocalities",
      { params, signal }
    );
    return data || [];
  } catch (error) {
    if (!isAbort(error)) console.error("Error fetching localities:", error);
    return null;
  }
};

export const fetchSublocalities = async (
  params: { query: string; localityPlaceId?: string; locality?: string; city?: string },
  signal?: AbortSignal
): Promise<SubLocalitySuggestion[] | null> => {
  try {
    const { data } = await axiosClient.get<SubLocalitySuggestion[]>(
      "/fetchSublocalities",
      { params, signal }
    );
    return data || [];
  } catch (error) {
    if (!isAbort(error)) console.error("Error fetching sublocalities:", error);
    return null;
  }
};

export const fetchApartments = async (
  locality: string,
  city: string,
  signal?: AbortSignal
): Promise<any[] | null> => {
  try {
    const { data } = await axiosClient.get<any[]>("/fetchApartments", {
      params: { locality, city },
      signal,
    });
    return data || [];
  } catch (error) {
    if (!isAbort(error)) console.error("Error fetching apartments:", error);
    return null;
  }
};

export const fetchHomePageCity = async (
  lat: string | number,
  lng: string | number,
  signal?: AbortSignal
) => {
  try {
    const { data } = await axiosClient.get("/fetchHomePageCity", {
      params: { lat, lng },
      signal,
    });
    return data;
  } catch (error) {
    if (!isAbort(error)) console.error("Error fetching home page city:", error);
    return null;
  }
};
export const getCurrentAddress = async (
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodeResult | null> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Google Maps API key is missing");

    const { data } = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: { latlng: `${lat},${lng}`, key: apiKey },
        signal,
      }
    );

    if (!data.results || data.results.length === 0) return null;

    const addressComponents = data.results[0].address_components;

    const getComponent = (type: string) =>
      addressComponents.find((c: any) => c.types.includes(type))?.long_name || "";

    const result: ReverseGeocodeResult = {
      city: getComponent("locality") || getComponent("administrative_area_level_2"),
      state: getComponent("administrative_area_level_1"),
      // country: getComponent("country"),
      locality: getComponent("sublocality") || getComponent("neighborhood"),
      subLocality: getComponent("sublocality_level_1"),
      street: getComponent("route"),
      zipCode: getComponent("postal_code"),
      formattedAddress: data.results[0].formatted_address,
      city_place_id:
        addressComponents.find((c: any) => c.types.includes("locality"))?.place_id || "",
      locality_place_id:
        addressComponents.find((c: any) =>
          c.types.includes("sublocality") || c.types.includes("neighborhood")
        )?.place_id || "",
      city_location: { lat, lng },
      locality_location: { lat, lng },
    };

    return result;
  } catch (err: any) {
    console.error("Error fetching current address:", err.message || err);
    return null;
  }
};


// export const getCurrentAddress = async (
//   lat: number,
//   lng: number,
//   signal?: AbortSignal
// ): Promise<ReverseGeocodeResult | null> => {
//   try {
//     const { data } = await axiosClient.get<ReverseGeocodeResult>(
//       "/current-location",
//       { params: { lat, lng }, signal }
//     );
//     return data || null;
//   } catch (error) {
//     if (!isAbort(error)) console.error("Error fetching current address:", error);
//     return null;
//   }
// };

export const getLocationDetails = async (place_id: string) => {
  if (!place_id) throw new Error("place_id is required");
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

export const fetchNearbyLocations = async ({
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
