import { NextApiRequest, NextApiResponse } from "next";
import { getGa4Client, getGa4PropertyId, isGa4Configured } from "@/lib/ga4Server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isGa4Configured()) {
    return res.status(200).json([]);
  }

  const analyticsDataClient = getGa4Client();
  if (!analyticsDataClient) {
    return res.status(200).json([]);
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: getGa4PropertyId(),
      dateRanges: [{ startDate: "60 daysAgo", endDate: "today" }],
      dimensions: [
        { name: "eventName" },
        { name: "customEvent:propertyname" },
        { name: "customEvent:item_id" },
        { name: "customEvent:location" },
        { name: "customEvent:city" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "Property_Impression" },
        },
      },
    });

    const data =
      response.rows?.map((row) => ({
        eventName: row.dimensionValues?.[0]?.value || "Unknown Event",
        propertyname: row.dimensionValues?.[1]?.value || "",
        itemId: row.dimensionValues?.[2]?.value || "",
        location: row.dimensionValues?.[3]?.value || "",
        city: row.dimensionValues?.[4]?.value || "",
        eventCount: row.metricValues?.[0]?.value || "0",
      })) || [];

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    res.status(200).json([]);
  }
}
