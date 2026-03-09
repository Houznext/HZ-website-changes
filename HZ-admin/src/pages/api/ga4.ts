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
      dateRanges: [{ startDate: "3 daysAgo", endDate: "today" }],
      dimensions: [{ name: "country" }, { name: "city" }, { name: "date" },],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "engagedSessions" },
      ],
      limit: 1000,
    });

    if (!response.rows) {
      return res.status(500).json({ error: "No data found in GA4 response" });
    }

    const result = [];

    response.rows.forEach((row) => {
      const country = row.dimensionValues?.[0]?.value || "Unknown Country";
      const city = row.dimensionValues?.[1]?.value || "Unknown City";
      const date=row.dimensionValues?.[2]?.value||'unknown';
      const sessions = parseInt(row.metricValues?.[0]?.value || "0");
      const activeUsers = parseInt(row.metricValues?.[1]?.value || "0");
      const pageViews = parseInt(row.metricValues?.[2]?.value || "0");
      const engagedSessions = parseInt(row.metricValues?.[3]?.value || "0");

      const bounceRate = sessions > 0 ? ((sessions - engagedSessions) / sessions) : 0;

      result.push({
        country,
        city,
        date,
        sessions,
        activeUsers,
        pageViews,
        bounceRate: `${(bounceRate * 100).toFixed(2)}%`,
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    res.status(500).json({ error: "Error fetching GA4 data" });
  }
}
