import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const GOOGLE_PLACES_TEXTSEARCH_API =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const extractData = (str: string) => {
  const finalAddress = str?.split(",");
  const remainingElements = finalAddress?.slice(0, -2);
  const returnValue = {
    city: remainingElements[remainingElements?.length - 1],
    locality: remainingElements[remainingElements?.length - 2],
    description: remainingElements.join(","),
  };

  return returnValue;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, locality } = req.query;

  if (!city || !locality) {
    return res.status(400).json({
      error: "City and locality are required parameters to fetch apartments",
    });
  }

  try {
    const response = await axios.get(GOOGLE_PLACES_TEXTSEARCH_API, {
      params: {
        query: `Apartments in ${locality} ${city}`,
        types: "establishments",
        components: "country:in",
        key: API_KEY,
      },
    });

    const appartments = response?.data?.results?.map((result: any) => {
      const address = extractData(result?.formatted_address);

      const returnData = {
        city: address.city,
        locality: address.locality,
        apartment: result.name,
        description: address.description,
        place_id: result?.place_id,
      };

      return returnData;
    });

    const filteredApartments = appartments?.filter((apartment: any) => {
      return (
        apartment?.city?.trim().toLowerCase() ===
          (city as string).toLowerCase() &&
        apartment?.locality?.trim().toLowerCase() ===
          (locality as string).toLowerCase()
      );
    });

    return res.status(200).json(filteredApartments || []);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch apartments" });
  }
}
