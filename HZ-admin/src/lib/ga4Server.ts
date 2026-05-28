import fs from 'fs';
import path from 'path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const KEY_FILE = path.join(process.cwd(), 'my-service-account-file.json');

/** GA4 only runs when explicitly enabled and the service-account JSON exists. */
export function isGa4Configured(): boolean {
  const flag = process.env.GA4_ENABLED?.trim().toLowerCase();
  if (flag !== 'true' && flag !== '1') return false;
  return fs.existsSync(KEY_FILE);
}

let cachedClient: BetaAnalyticsDataClient | null = null;

export function getGa4Client(): BetaAnalyticsDataClient | null {
  if (!isGa4Configured()) return null;
  if (!cachedClient) {
    cachedClient = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE });
  }
  return cachedClient;
}

export const GA4_PROPERTY_ID = 'properties/529425140';
