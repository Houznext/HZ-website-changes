import type { NextApiRequest, NextApiResponse } from 'next'
import { getCityMeta } from '@/lib/cityLandingRegistry'

/** @deprecated Use /api/revalidate-city-landing with body { city: 'vikarabad' } */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const secret =
    (typeof req.query.secret === 'string' ? req.query.secret : undefined) ||
    (typeof req.body?.secret === 'string' ? req.body.secret : undefined)

  const expected =
    process.env.REVALIDATE_SECRET ||
    process.env.NEXT_PUBLIC_REVALIDATE_SECRET ||
    'houznext-dev-revalidate'

  if (!secret || secret !== expected) {
    return res.status(401).json({ message: 'Invalid revalidation token' })
  }

  const path = getCityMeta('vikarabad').path

  try {
    await res.revalidate(path)
    return res.json({ revalidated: true, path })
  } catch (err) {
    console.error('Vikarabad revalidate failed:', err)
    return res.status(500).json({ message: 'Revalidation failed' })
  }
}
