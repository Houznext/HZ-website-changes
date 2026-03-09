import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  return res.status(410).json({
    error:
      "Deprecated endpoint. Use POST /api/floorplans/generate with GeneratePlanRequest JSON from propertyInformation.",
  });
}
