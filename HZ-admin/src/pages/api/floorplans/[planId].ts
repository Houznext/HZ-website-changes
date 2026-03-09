import type { NextApiRequest, NextApiResponse } from "next";
import { findFloorPlanById } from "@/src/lib/floorplan/repository";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const planId = String(req.query.planId || "").trim();
    if (!planId) return res.status(400).json({ error: "planId is required" });

    const plan = await findFloorPlanById(planId);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    return res.status(200).json({ planId, placedPlan: plan });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Failed to fetch plan" });
  }
}
