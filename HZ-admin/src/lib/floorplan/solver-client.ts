import { PlanSpec, PlacedPlan } from "./contracts";
import { LlmLayoutPlan } from "./llm";

const SOLVER_URL = process.env.FLOORPLAN_SOLVER_URL || "http://127.0.0.1:8000/solve";

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};

export const solvePlanSpec = async (
  planSpec: PlanSpec,
  generateVariants: number,
  llmLayouts?: LlmLayoutPlan[],
  timeoutMs = 30000
): Promise<PlacedPlan> => {
  const res = await withTimeout(
    fetch(SOLVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planSpec,
        generateVariants,
        llmLayouts: llmLayouts || null,
      }),
    }),
    timeoutMs
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Solver call failed (${res.status}): ${text}`);
  }

  const body = (await res.json()) as PlacedPlan;
  if (!body || typeof body !== "object" || !Array.isArray(body.portions)) {
    throw new Error("Invalid solver response schema");
  }
  return body;
};
