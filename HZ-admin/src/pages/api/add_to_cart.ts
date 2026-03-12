import { NextApiRequest, NextApiResponse } from "next";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import path from "path";


const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(process.cwd(), "my-service-account-file.json"), 
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // If GA4 is not configured, return an empty dataset instead of erroring
    if (!process.env.GA4_ENABLED) {
      return res.status(200).json({
        data: [],
        message: "GA4 reporting is disabled or not configured.",
      });
    }
    const [response] = await analyticsDataClient.runReport({
      property: "properties/465093464", 
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
    // In production we don't want this to surface as a 500 – just return empty data
    return res.status(200).json({
      data: [],
      error: "GA4 analytics data unavailable (authentication or configuration issue).",
    });
  }
}