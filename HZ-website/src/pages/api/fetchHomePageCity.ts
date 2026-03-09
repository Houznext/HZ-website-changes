import type { NextApiRequest, NextApiResponse } from "next";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

type Data = {
  city?: string | null;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: "Latitude and longitude are required" });
    return;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      const cityComponent = addressComponents.find((component: any) =>
        component.types.includes("locality")
      );
      const city = cityComponent ? cityComponent.long_name : null;

      if (city) {
        res.status(200).json({ city });
      } else {
        res.status(200).json({ city: null, error: "City not found" });
      }
    } else {
      res.status(200).json({ city: null, error: "City not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
