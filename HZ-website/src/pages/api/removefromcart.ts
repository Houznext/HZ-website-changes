import { NextApiRequest, NextApiResponse } from "next";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import path from "path";

// Set up the Google Analytics Data API client
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(process.cwd(), "my-service-account-file.json"), // Use your service account key
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch the GA4 report for `item_click` events
    const [response] = await analyticsDataClient.runReport({
      property: "properties/465093464", // Replace with your GA4 Property ID
      dateRanges: [{ startDate: "30 daysAgo", endDate: "today" }],
      dimensions: [
        { name: "eventName" },
        { name: "customEvent:item_id" }, // Event parameter for item_id
        { name: "customEvent:item_name" }, // Event parameter for item_name
        { name: "customEvent:category" }, // Event parameter for category
        
      
        // Event parameter for discount
      ],
      metrics: [{ name: "eventCount" }], // Count of the events
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "remove_from_cart" },
        },
      },
    });

    // Map the response to a user-friendly format
    const data =
      response.rows?.map((row) => ({
        eventName: row.dimensionValues?.[0]?.value || "Unknown Event",
        itemId: row.dimensionValues?.[1]?.value || "",
        itemName: row.dimensionValues?.[2]?.value || "N/A",
        category: row.dimensionValues?.[3]?.value || "N/A",
       

        eventCount: row.metricValues?.[0]?.value || "0",
      })) || [];

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    res.status(500).json({ error: "Error fetching GA4 analytics data" });
  }
}