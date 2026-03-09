import { NextApiRequest, NextApiResponse } from "next"; // Import the types
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
      dimensions: [
        { name: "pageTitle" },
        { name: "pagePath" },
        { name: "country" },
        { name: "deviceCategory" },
        {
          name: "Browser",
        },
        { name: "city" },
        {name:'eventName'},
       
        { name: "sessionSource" },
        { name: "date" },
        
      ],
      metrics: [
        { name: "screenPageViews" },
        { name: "userEngagementDuration" },
        { name: "sessions" },
        { name: "eventCount" },
        { name: "activeUsers" },
        

      ],
      
    });

   
    if (!response.rows) {
      return res.status(500).json({ error: "No data found in GA4 response" });
    }

    
    const data = response.rows.map((row) => {
     
      const pageTitle = row.dimensionValues?.[0]?.value || "Unknown Page Title";
      const pagePath = row.dimensionValues?.[1]?.value || "Unknown Page Path"; 
      const pageViews = row.metricValues?.[0]?.value || "0";
      const country = row.dimensionValues?.[2]?.value || "unknown country";
      const deviceCategory =
        row.dimensionValues?.[3].value || "unknown device category";
      const browser = row.dimensionValues?.[4].value || "unknown browser";
      const city = row.dimensionValues?.[5].value || "unknown city";
      //const operatingSystem = row.dimensionValues?.[6]?.value || "Unknown OS";
      const eventname=row.dimensionValues?.[6].value||'unknown event';
      const sessionsource = row.dimensionValues?.[7].value || "0";
      const Date = row.dimensionValues?.[8].value || "0";
      
      const userEngagementDuration = row.metricValues?.[1]?.value || "0";
      const sessions = row.metricValues?.[2]?.value || "0";
      const eventCount = row.metricValues?.[3].value || "0";
      const activeuser = row.metricValues?.[4].value || "0";
      

      return {
        pageTitle,
        pagePath,
        pageViews,
        country,
        deviceCategory,
        browser,
        city,
        //operatingSystem,
        eventname,
        userEngagementDuration,
        sessions,
        eventCount,
        activeuser,
        sessionsource,
        Date,
       
        
      };
    });

    
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GA4 data:", error);
    res.status(500).json({ error: "Error fetching GA4 data" });
  }
}