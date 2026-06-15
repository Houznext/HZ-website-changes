import type { NextApiRequest, NextApiResponse } from 'next'
import { getDefaultCityContent } from '@/lib/cityLandingDefaults'

/** @deprecated Use /api/city-landing-defaults?city=vikarabad */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getDefaultCityContent('vikarabad'))
}
