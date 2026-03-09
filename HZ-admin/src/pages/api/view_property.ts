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
    const [response] = await analyticsDataClient.runReport({
      property: "properties/465093464",
      dateRanges: [{ startDate: "60 daysAgo", endDate: "today" }],
      dimensions: [
        { name: "eventName" },
        { name: "customEvent:propertyname" },
        { name: "customEvent:item_id" },

        { name: "customEvent:phone" },
        { name: "customEvent:location" },
        { name: "customEvent:city" },

        { name: "customEvent:username" },

        { name: "city" },
        { name: "customEvent:customuserid" },

        // { name: "customEvent: phone" },
        //  { name: "customEvent: item_id" },
      ],
      metrics: [{ name: "eventCount" }, { name: "userEngagementDuration" },
        // { name: "date" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: "View_property" },
        },
      },
    });

    const data =
      response.rows?.map((row) => ({
        eventName: row.dimensionValues?.[0]?.value || "Unknown Event",
        propertyname: row.dimensionValues?.[1]?.value || "",
        itemId: row.dimensionValues?.[2]?.value || "",
        phone: row.dimensionValues?.[3]?.value || "N/A",
        location: row.dimensionValues?.[4]?.value || "",
        city: row.dimensionValues?.[5]?.value || "",

        username: row.dimensionValues?.[6]?.value || "",

        usercity: row.dimensionValues?.[7].value || "",

        customuserid: row.dimensionValues?.[8]?.value || "N/A",
   

        eventCount: row.metricValues?.[0]?.value || "0",

        userEngagementDuration: row.metricValues?.[1]?.value || "0",
        // date:row.metricValues?.[2]?.value || "0"
      })) || [];

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    res.status(500).json({ error: "Error fetching GA4 analytics data" });
  }
}
