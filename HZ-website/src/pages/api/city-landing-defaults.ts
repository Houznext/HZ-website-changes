import type { NextApiRequest, NextApiResponse } from 'next'
import { getDefaultCityContent } from '@/lib/cityLandingDefaults'
import { CITY_SLUGS, type CitySlug } from '@/lib/cityLandingRegistry'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const city = typeof req.query.city === 'string' ? req.query.city : 'vikarabad'
  if (!CITY_SLUGS.includes(city as CitySlug)) {
    return res.status(400).json({ message: 'Invalid city slug' })
  }
  res.status(200).json(getDefaultCityContent(city as CitySlug))
}
