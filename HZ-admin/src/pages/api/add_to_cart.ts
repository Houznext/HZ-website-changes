import { NextApiRequest, NextApiResponse } from "next";
import { getGa4Client, getGa4PropertyId, isGa4Configured } from "@/src/lib/ga4Server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isGa4Configured()) {
    return res.status(200).json({
      data: [],
      message: "GA4 reporting is disabled or not configured.",
    });
  }

  const analyticsDataClient = getGa4Client();
  if (!analyticsDataClient) {
    return res.status(200).json({ data: [], message: "GA4 client unavailable." });
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: getGa4PropertyId(),
      dateRanges: [{ startDate: "150 daysAgo", endDate: "today" }],
      dimensions: [
        { name: "eventName" },
        { name: "customEvent:item_id" },
        { name: "customEvent:item_name" },
        { name: "customEvent:category" },
        { name: "customEvent:type" },
      ],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "add_to_cart" },
        },
      },
    });

    const data =
      response.rows?.map((row) => ({
        eventName: row.dimensionValues?.[0]?.value || "Unknown Event",
        itemId: row.dimensionValues?.[1]?.value || "",
        itemName: row.dimensionValues?.[2]?.value || "N/A",
        category: row.dimensionValues?.[3]?.value || "N/A",
        type: row.dimensionValues?.[4]?.value || "N/A",
        eventCount: row.metricValues?.[0]?.value || "0",
      })) || [];

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    return res.status(200).json({
      data: [],
      error: "GA4 analytics data unavailable (authentication or configuration issue).",
    });
  }
}
