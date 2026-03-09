import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const GOOGLE_PLACES_DETAILS_API =
  "https://maps.googleapis.com/maps/api/place/details/json";
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const extractShortDescription = (
  formattedAddress: string,
  editorialSummary?: any
) => {
  if (editorialSummary && editorialSummary.overview) {
    return editorialSummary.overview;
  }

  return formattedAddress;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { place_id } = req.query;

  if (!place_id || Array.isArray(place_id)) {
    return res.status(400).json({ error: "Please provide a valid place_id" });
  }

  try {
    // Specify the fields you want to retrieve
    const fields =
      "name,formatted_address,editorial_summary,geometry,address_components";

    const response = await axios.get(GOOGLE_PLACES_DETAILS_API, {
      params: {
        place_id,
        fields,
        key: API_KEY,
      },
    });

    const result = response.data.result;

    if (!result) {
      return res.status(404).json({ error: "Place not found" });
    }

    const description = extractShortDescription(
      result.formatted_address,
      result.editorial_summary
    );

    const returnData = {
      name: result.name,
      formatted_address: result.formatted_address,
      description,
      geometry: result.geometry,
      address_components: result.address_components,
      place_id: result.place_id,
    };

    return res.status(200).json(returnData);
  } catch (error) {
    console.error("Failed to fetch place details", error);
    return res.status(500).json({ error: "Failed to fetch place details" });
  }
}
