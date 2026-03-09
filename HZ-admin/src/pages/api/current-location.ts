import type { NextApiRequest, NextApiResponse } from "next";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

type LatLng = { lat: number; lng: number };

function pick(
  comps: any[] | undefined,
  ...types: string[]
): string | undefined {
  const c = comps?.find((x) => types.every((t) => x.types?.includes(t)));
  return c?.long_name;
}

function resultByType(results: any[], ...types: string[]) {
  return results.find((r) => types.every((t) => r.types?.includes(t)));
}

function centerFromViewport(vp?: { northeast?: LatLng; southwest?: LatLng }): LatLng | null {
  if (!vp?.northeast || !vp?.southwest) return null;
  return {
    lat: (vp.northeast.lat + vp.southwest.lat) / 2,
    lng: (vp.northeast.lng + vp.southwest.lng) / 2,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lng } = req.query as { lat?: string; lng?: string };

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("language", "en-IN");
    url.searchParams.set("components", "country:IN");
    url.searchParams.set(
      "result_type",
      [
        "street_address",
        "premise",
        "subpremise",
        "route",
        "sublocality",
        "sublocality_level_1",
        "locality",
      ].join("|")
    );
    url.searchParams.set("location_type", "ROOFTOP|GEOMETRIC_CENTER");

    const resp = await fetch(url.toString());
    const data = await resp.json();

    const results: any[] = data?.results ?? [];
    if (!results.length) {
      return res.status(404).json({ error: "Address not found" });
    }

    const primary = results[0];
    const comps = primary.address_components ?? [];

    const state =
      pick(comps, "administrative_area_level_1", "political") ||
      pick(comps, "administrative_area_level_2", "political") ||
      "";

    const city =
      pick(comps, "locality", "political") ||
      pick(resultByType(results, "locality")?.address_components, "locality", "political") ||
      "";

    const localityComp =
      pick(comps, "sublocality_level_1", "political") ||
      pick(comps, "neighborhood", "political") ||
      pick(comps, "sublocality", "political") ||
      "";
    const subLocalityComp =
      pick(comps, "sublocality_level_2", "political") ||
      pick(comps, "sublocality_level_3", "political") ||
      "";

    const street =
      (() => {
        const streetNumber = pick(comps, "street_number");
        const route = pick(comps, "route");
        if (route && streetNumber) return `${streetNumber} ${route}`;
        if (route) return route;
        return "";
      })() || "";

    const zipCode =
      String(
        pick(comps, "postal_code") ??
          pick(resultByType(results, "postal_code")?.address_components, "postal_code") ??
          ""
      )
        .replace(/\D/g, "")
        .slice(0, 6);

    const formattedAddress =
      primary.formatted_address ||
      resultByType(results, "street_address")?.formatted_address ||
      "";

    const cityResult =
      resultByType(results, "locality") ||
      results.find((r) =>
        r.address_components?.some((c: any) => c.types?.includes("locality"))
      );

    const localityResult =
      resultByType(results, "sublocality") ||
      resultByType(results, "sublocality_level_1") ||
      results.find((r) =>
        r.address_components?.some((c: any) => c.types?.includes("sublocality_level_1"))
      );

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

    const address = {
      city,
      state,
      locality: localityComp,
      subLocality: subLocalityComp,
      street,
      zipCode,
      formattedAddress,
      city_place_id,
      locality_place_id,
      city_location,
      locality_location,
    };

    return res.status(200).json({ address });
  } catch (e) {
    console.error("current-location error", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
