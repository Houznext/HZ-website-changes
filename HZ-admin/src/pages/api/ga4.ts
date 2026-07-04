import type { NextApiRequest, NextApiResponse } from 'next';
import { getGa4Client, getGa4PropertyId, isGa4Configured } from '@/src/lib/ga4Server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isGa4Configured()) {
    return res.status(200).json({
      data: [],
      message: 'GA4 reporting is disabled or not configured.',
    });
  }

  const analyticsDataClient = getGa4Client();
  if (!analyticsDataClient) {
    return res.status(200).json({ data: [], message: 'GA4 client unavailable.' });
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: getGa4PropertyId(),
      dateRanges: [{ startDate: '3 daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'country' }, { name: 'city' }, { name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'engagedSessions' },
      ],
      limit: 1000,
    });

    if (!response.rows) {
      return res.status(200).json({ data: [], message: 'No data in GA4 response.' });
    }

    const result = response.rows.map((row) => {
      const country = row.dimensionValues?.[0]?.value || 'Unknown Country';
      const city = row.dimensionValues?.[1]?.value || 'Unknown City';
      const date = row.dimensionValues?.[2]?.value || 'unknown';
      const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const activeUsers = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const pageViews = parseInt(row.metricValues?.[2]?.value || '0', 10);
      const engagedSessions = parseInt(row.metricValues?.[3]?.value || '0', 10);
      const bounceRate = sessions > 0 ? (sessions - engagedSessions) / sessions : 0;

      return {
        country,
        city,
        date,
        sessions,
        activeUsers,
        pageViews,
        bounceRate: `${(bounceRate * 100).toFixed(2)}%`,
      };
    });

    return res.status(200).json(result);
  } catch {
    return res.status(200).json({
      data: [],
      error: 'GA4 data unavailable (authentication or configuration issue).',
    });
  }
}
