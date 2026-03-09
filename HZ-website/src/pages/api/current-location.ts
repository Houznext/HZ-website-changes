import type { NextApiRequest, NextApiResponse } from "next";

const API_KEY =
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "";
const GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json";

type LatLng = { lat: number; lng: number };
type GeocodeResult = {
  address_components?: Array<{ long_name: string; types: string[] }>;
  formatted_address?: string;
  geometry?: {
    location?: LatLng;
    viewport?: { northeast?: LatLng; southwest?: LatLng };
  };
  place_id?: string;
  types?: string[];
};

const pick = (comps: any[] | undefined, ...types: string[]) =>
  comps?.find((c) => types.every((t) => c.types?.includes(t)))?.long_name;

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

const typeScore = (types: string[] = []) => {
  const has = (t: string) => types.includes(t);
  let s = 0;
  if (has("street_address")) s += 100; // most precise
  if (has("premise") || has("subpremise")) s += 60;
  if (has("route")) s += 50; // road name
  if (has("sublocality") || has("sublocality_level_1")) s += 20;
  if (has("locality")) s += 10; // city
  if (has("plus_code")) s -= 20;
  if (has("country")) s -= 40;
  return s;
};

// helper to find a component across multiple results (primary-first)
const findAcross = (results: GeocodeResult[], ...types: string[]) => {
  for (const r of results) {
    const v = r.address_components?.find((c) =>
      types.every((t) => c.types?.includes(t))
    )?.long_name;
    if (v) return v;
  }
  return "";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { lat, lng } = req.query as { lat?: string; lng?: string };

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
  }
  if (!API_KEY || API_KEY.trim() === "") {
    return res.status(500).json({
      error: "Google Maps API key not configured",
      detail: "Set GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local",
    });
  }

  try {
    const url = new URL(GEOCODE);
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("language", "en-IN");
    url.searchParams.set(
      "result_type",
      [
        "street_address",
        "route",
        "premise",
        "subpremise",
        "postal_code",
        "sublocality",
        "sublocality_level_1",
        "locality",
        "administrative_area_level_2",
      ].join("|")
    );

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      return res
        .status(resp.status)
        .json({ error: `Geocode HTTP ${resp.status}` });
    }

    const data: {
      status: string;
      results: GeocodeResult[];
      error_message?: string;
    } = await resp.json();

    if (data.status !== "OK") {
      const code = data.status === "ZERO_RESULTS" ? 404 : 502;
      return res.status(code).json({
        error: `Geocode status: ${data.status}`,
        message: data.error_message ?? undefined,
      });
    }

    const results = data.results ?? [];
    if (!results.length) {
      return res.status(404).json({ error: "Address not found" });
    }

    const sorted = [...results].sort(
      (a, b) => typeScore(b.types || []) - typeScore(a.types || [])
    );
    const primary = sorted[0];
    if (!primary) {
      return res.status(404).json({ error: "Address not found" });
    }
    const comps = primary.address_components ?? [];

    const state =
      pick(comps, "administrative_area_level_1", "political") ||
      pick(comps, "administrative_area_level_2", "political") ||
      "";

    const localityResult =
      results.find((r) =>
        r.types?.some((t) =>
          ["sublocality", "sublocality_level_1", "neighborhood"].includes(t)
        )
      ) ?? null;

    const cityResult =
      results.find((r) => r.types?.includes("locality")) ||
      results.find((r) => r.types?.includes("administrative_area_level_2")) ||
      null;

    const city =
      pick(comps, "locality", "political") ||
      pick(cityResult?.address_components, "locality", "political") ||
      "";

    const locality =
      pick(comps, "sublocality_level_1", "political") ||
      pick(comps, "neighborhood", "political") ||
      pick(comps, "sublocality", "political") ||
      "";

    const subLocality =
      pick(comps, "sublocality_level_2", "political") ||
      pick(comps, "sublocality_level_3", "political") ||
      "";

    const streetNumber =
      findAcross([primary, ...results], "street_number") || "";
    const routeName = findAcross([primary, ...results], "route") || "";
    let street = routeName
      ? streetNumber
        ? `${streetNumber} ${routeName}`
        : routeName
      : "";

    if (!street) {
      const url2 = new URL(GEOCODE);
      url2.searchParams.set("latlng", `${lat},${lng}`);
      url2.searchParams.set("key", API_KEY);
      url2.searchParams.set("language", "en-IN");
      url2.searchParams.set("result_type", "street_address|route");

      const r2 = await fetch(url2.toString());
      if (r2.ok) {
        const d2: { results?: GeocodeResult[] } = await r2.json();
        const rts = d2?.results ?? [];
        if (rts.length) {
          const best = [...rts].sort(
            (a, b) => typeScore(b.types || []) - typeScore(a.types || [])
          )[0];
          const c2 = best.address_components ?? [];
          const sn2 =
            c2.find((c) => c.types?.includes("street_number"))?.long_name || "";
          const rt2 =
            c2.find((c) => c.types?.includes("route"))?.long_name || "";
          if (rt2) street = sn2 ? `${sn2} ${rt2}` : rt2;
        }
      }
    }

    const postalFromPrimary = pick(comps, "postal_code");
    const postalFromAny = results.find((r) =>
      r.types?.includes("postal_code")
    )?.address_components;
    const zipCode = String(
      postalFromPrimary || pick(postalFromAny, "postal_code") || ""
    )
      .replace(/\D/g, "")
      .slice(0, 6); // Indian PIN

    const formattedAddress =
      primary.formatted_address ||
      results.find((r) => r.types?.includes("street_address"))
        ?.formatted_address ||
      "";

    const city_place_id = cityResult?.place_id || "";
    const locality_place_id = localityResult?.place_id || "";
    const city_location =
      cityResult?.geometry?.location ||
      centerFromViewport(cityResult?.geometry?.viewport) ||
      null;
    const locality_location =
      localityResult?.geometry?.location ||
      centerFromViewport(localityResult?.geometry?.viewport) ||
      null;

    return res.status(200).json({
      address: {
        city,
        state,
        locality,
        subLocality,
        street,
        zipCode,
        formattedAddress,
        city_place_id,
        locality_place_id,
        city_location,
        locality_location,
        place_id: locality_place_id || city_place_id || primary.place_id || "",
      },
    });
  } catch (e: any) {
    console.error("current-location error", e);
    const message =
      e?.message || (typeof e === "string" ? e : "Internal server error");
    return res.status(500).json({
      error: "Internal server error",
      detail: process.env.NODE_ENV === "development" ? message : undefined,
    });
  }
}
