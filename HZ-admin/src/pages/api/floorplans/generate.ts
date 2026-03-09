import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import {
  FLOORPLAN_CONTRACT_VERSION,
  GeneratePlanRequest,
  PlanSpec,
  PlacedPlan,
} from "@/src/lib/floorplan/contracts";
import { normalizeGeneratePlanRequest } from "@/src/lib/floorplan/normalize";
import { validateGeneratePlanRequest } from "@/src/lib/floorplan/validate-request";
import { expandPlanProgram } from "@/src/lib/floorplan/program-expander";
import { solvePlanSpec } from "@/src/lib/floorplan/solver-client";
import { generateLayoutWithLlm, LlmLayoutPlan } from "@/src/lib/floorplan/llm";

const MAX_FLOORS = 5;
const MAX_PORTIONS_PER_FLOOR = 8;

const normalizeFromLegacyPropertyInformation = (
  body: any
): GeneratePlanRequest => {
  if (body?.construction_scope && body?.house_construction_info) {
    return {
      schemaVersion: body.schemaVersion || FLOORPLAN_CONTRACT_VERSION,
      id: body.id,
      propertyName: body.propertyName,
      construction_scope: "House",
      property_type: body.property_type,
      construction_type: body.construction_type,
      house_construction_info: body.house_construction_info,
      vastuPreference: body.vastuPreference,
      roomConstraints: body.roomConstraints,
      constructionRules: body.constructionRules,
      staircase: body.staircase,
      portionAreaDistribution: body.portionAreaDistribution,
      tolerance: body.tolerance,
      generateVariants: body.generateVariants,
      seed: body.seed,
    };
  }

  throw new Error("Invalid request. Expected GeneratePlanRequest shape.");
};

const addPlanIdIfMissing = (plan: PlacedPlan, planId: string, requestHash: string): PlacedPlan => ({
  ...plan,
  schemaVersion: plan.schemaVersion || FLOORPLAN_CONTRACT_VERSION,
  planId: plan.planId || planId,
  requestHash: plan.requestHash || requestHash,
  createdAtIso: plan.createdAtIso || new Date().toISOString(),
  warnings: plan.warnings || [],
});

const validateScaleLimits = (request: GeneratePlanRequest): void => {
  const floors = request.house_construction_info?.floors || [];
  if (floors.length > MAX_FLOORS) {
    throw new Error(`Maximum ${MAX_FLOORS} floors are supported per request.`);
  }
  floors.forEach((f, i) => {
    if (Number(f.portions || 0) > MAX_PORTIONS_PER_FLOOR) {
      throw new Error(`Floor ${i} exceeds maximum ${MAX_PORTIONS_PER_FLOOR} portions.`);
    }
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const request = normalizeFromLegacyPropertyInformation(req.body);
    validateGeneratePlanRequest(request);
    validateScaleLimits(request);

    const normalizedResult = normalizeGeneratePlanRequest(request);
    const { normalized, warnings: normalizeWarnings, requestHash } = normalizedResult;

    const { planSpecBase, warnings: expandWarnings } = expandPlanProgram(
      normalized,
      requestHash,
      normalized.seed
    );

    const planSpec: PlanSpec = {
      ...planSpecBase,
      generator: { provider: "hybrid-llm", model: "gemini-2.5-flash" },
    };

    // Step 1: Ask LLM for layout strategy
    let llmLayouts: LlmLayoutPlan[] | undefined;
    const llmWarnings: string[] = [];

    try {
      console.log("[generate] Calling LLM for layout strategy...");
      const portion = planSpec.portions[0]; // Use first portion for LLM
      if (portion) {
        const llmResult = await generateLayoutWithLlm(
          portion,
          normalized.generateVariants,
          120000 // 120s timeout for Gemini 2.5 Flash (thinking model)
        );
        llmLayouts = llmResult.layouts;
        llmWarnings.push(...llmResult.warnings);
        console.log(`[generate] LLM returned ${llmLayouts.length} layouts`);
      }
    } catch (llmError: any) {
      console.warn(`[generate] LLM failed, using deterministic fallback: ${llmError.message}`);
      llmWarnings.push(`LLM layout generation failed: ${llmError.message}. Using deterministic fallback.`);
    }

    // Step 2: Pass LLM layouts to solver for exact coordinate conversion
    const solved = await solvePlanSpec(planSpec, normalized.generateVariants, llmLayouts);
    const planId = solved.planId || randomUUID();
    const placedPlan = addPlanIdIfMissing(solved, planId, requestHash);
    placedPlan.warnings = [
      ...normalizeWarnings,
      ...expandWarnings,
      ...llmWarnings,
      ...(placedPlan.warnings || []),
    ];

    return res.status(200).json({
      planId,
      placedPlan,
      warnings: placedPlan.warnings,
      meta: {
        schemaVersion: FLOORPLAN_CONTRACT_VERSION,
        provider: llmLayouts ? "hybrid-llm" : "deterministic-fallback",
        model: llmLayouts ? "gemini-2.5-flash" : "v3-strip-packing",
        queue: "sync",
      },
    });
  } catch (error: any) {
    console.error("[generate] Error:", error?.message || error);
    return res.status(400).json({
      error: error?.message || "Failed to generate floor plan",
    });
  }
}
