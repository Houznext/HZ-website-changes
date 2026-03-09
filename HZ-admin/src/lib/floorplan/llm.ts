import { PortionPlanSpec, RoomSpec } from "./contracts";

/* ── Provider / model resolution ─────────────────────────────────────── */

const resolveProvider = (): "openai" | "gemini" => {
  const envProvider = (process.env.LLM_PROVIDER || "").toLowerCase();
  if (envProvider === "gemini" || envProvider === "openai") return envProvider;
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "openai";
};

const resolveModel = (provider: "openai" | "gemini"): string => {
  if (process.env.LLM_MODEL) return process.env.LLM_MODEL;
  return provider === "gemini" ? "gemini-2.5-flash" : "gpt-4.1-mini";
};

const normalizeGeminiModel = (model: string): string => {
  const m = model.trim();
  if (m === "gemini-1.5-flash") return "gemini-1.5-flash-latest";
  if (m === "gemini-1.5-pro") return "gemini-1.5-pro-latest";
  return m;
};

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const GEMINI_BASE_URL =
  process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";

/* ── Timeout helper ──────────────────────────────────────────────────── */

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

/* ── JSON extraction ─────────────────────────────────────────────────── */

const tryParseJson = (content: string): unknown => {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in LLM response");
  return JSON.parse(content.slice(start, end + 1));
};

/* ── Layout grid types ───────────────────────────────────────────────── */

export interface LayoutRow {
  /** Percentage of total plot depth this row takes (all rows must sum to 100) */
  depthPct: number;
  /** Rooms in this row from left to right */
  cells: Array<{
    roomId: string;
    /** Percentage of plot width this room takes within its row (must sum to 100 per row) */
    widthPct: number;
  }>;
}

export interface LlmLayoutPlan {
  /** Rows from SOUTH (bottom, away from road for north-facing) to NORTH (top, road side) */
  rows: LayoutRow[];
  /** Which variant number (1-based) */
  variant: number;
}

export interface LlmLayoutResult {
  layouts: LlmLayoutPlan[];
  provider: string;
  model: string;
  warnings: string[];
}

/* ── System prompt ───────────────────────────────────────────────────── */

const buildSystemPrompt = (): string => `You are an expert Indian residential architect who designs floor plans.

You output ONLY valid JSON. No markdown, no code fences, no commentary.

Your task: Given a plot boundary and list of rooms, produce grid-based floor plan layouts.

RULES FOR INDIAN HOUSE PLANS:
1. EVERY room in the input MUST appear in the output. Never drop any room.
2. Rooms fill the ENTIRE plot boundary — no gaps, no dead space, no corridors.
3. Bathrooms must be ATTACHED to bedrooms (share a wall, placed adjacent).
4. Kitchen should be adjacent to living/dining area.
5. Living room is the central hub — it should be accessible from the entrance.
6. Private rooms (bedrooms) go AWAY from the main gate; public rooms (living, kitchen) go NEAR the gate.
7. Each row spans the full plot width. Room widthPct values in a row MUST sum to exactly 100.
8. Row depthPct values MUST sum to exactly 100.
9. Minimum room width: 5ft for bathrooms, 8ft for other rooms.
10. Bedrooms should be at least 10ft in both dimensions.
11. Bathrooms should be 5-8ft wide and attached alongside their bedroom.

VASTU GUIDELINES:
- Master Bedroom: SW corner preferred
- Kitchen: SE or NW corner preferred
- Bathrooms: NW or SE, avoid NE
- Living/Entry: Near North or East entrance
- Pooja: NE corner if present

OUTPUT FORMAT (strict JSON):
{
  "layouts": [
    {
      "variant": 1,
      "rows": [
        {
          "depthPct": <number>,
          "cells": [
            { "roomId": "<exact room ID from input>", "widthPct": <number> },
            ...
          ]
        },
        ...
      ]
    },
    {
      "variant": 2,
      "rows": [...]
    },
    {
      "variant": 3,
      "rows": [...]
    }
  ]
}

IMPORTANT:
- "rows" are ordered from BOTTOM (away from gate for north-facing) to TOP (gate side for north-facing).
- For SOUTH-facing: rows go from TOP (away from gate) to BOTTOM (gate side).
- For EAST-facing: think of rows as going from LEFT (away) to RIGHT (gate).
- For WEST-facing: rows go from RIGHT (away) to LEFT (gate).
- Generate exactly 3 different layout variants with meaningfully different arrangements.
- Use the EXACT roomId strings from the input. Do not rename or create new IDs.`;

/* ── User prompt ─────────────────────────────────────────────────────── */

const buildUserPrompt = (portion: PortionPlanSpec, numVariants: number): string => {
  const rooms = portion.rooms.map((r: RoomSpec) => ({
    roomId: r.id,
    type: r.type,
    label: r.name,
    targetAreaFt2: r.targetAreaFt2,
    minWidthFt: r.minWidthFt,
    minHeightFt: r.minHeightFt,
  }));

  return JSON.stringify({
    task: "Generate grid-based floor plan layouts",
    plot: {
      widthFt: portion.boundaryFt.width,
      depthFt: portion.boundaryFt.length,
      totalAreaFt2: portion.boundaryFt.width * portion.boundaryFt.length,
      facing: portion.facing,
      gateSide: portion.gateSide,
    },
    rooms,
    vastu: portion.vastuPreference,
    numVariants: Math.min(numVariants, 3),
    output: "JSON only, exactly as specified in system prompt",
  }, null, 2);
};

/* ── API callers ─────────────────────────────────────────────────────── */

const callOpenAI = async (systemPrompt: string, userPrompt: string, timeoutMs: number): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");

  const res = await withTimeout(
    fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: resolveModel("openai"),
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    }),
    timeoutMs
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${err}`);
  }

  const json: any = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("Empty LLM response");
  return content;
};

const callGemini = async (systemPrompt: string, userPrompt: string, timeoutMs: number): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required when LLM_PROVIDER=gemini");

  const model = normalizeGeminiModel(resolveModel("gemini"));
  console.log(`[LLM] Calling Gemini model: ${model}`);

  const res = await withTimeout(
    fetch(`${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      }),
    }),
    timeoutMs
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${err}`);
  }

  const json: any = await res.json();
  const content = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content || typeof content !== "string") throw new Error("Empty Gemini response");
  return content;
};

/* ── Validation ──────────────────────────────────────────────────────── */

const validateLayout = (
  layout: any,
  roomIds: Set<string>,
  plotWidth: number,
  plotDepth: number
): { valid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  if (!layout || !Array.isArray(layout.rows) || layout.rows.length === 0) {
    return { valid: false, warnings: ["Layout has no rows"] };
  }

  // Check all roomIds appear exactly once
  const usedIds = new Set<string>();
  for (const row of layout.rows) {
    if (!Array.isArray(row.cells)) {
      return { valid: false, warnings: ["Row has no cells"] };
    }
    for (const cell of row.cells) {
      if (!cell.roomId || typeof cell.roomId !== "string") {
        return { valid: false, warnings: ["Cell missing roomId"] };
      }
      if (usedIds.has(cell.roomId)) {
        warnings.push(`Duplicate roomId: ${cell.roomId}`);
      }
      usedIds.add(cell.roomId);
    }
  }

  // Check all input rooms are present
  for (const id of roomIds) {
    if (!usedIds.has(id)) {
      return { valid: false, warnings: [`Missing room: ${id}`] };
    }
  }

  // Normalize percentages to sum to 100
  let totalDepthPct = 0;
  for (const row of layout.rows) {
    totalDepthPct += row.depthPct || 0;
    let totalWidthPct = 0;
    for (const cell of row.cells) {
      totalWidthPct += cell.widthPct || 0;
    }
    // Auto-fix if close
    if (Math.abs(totalWidthPct - 100) > 0.1 && Math.abs(totalWidthPct - 100) < 10) {
      const factor = 100 / totalWidthPct;
      for (const cell of row.cells) {
        cell.widthPct = Math.round(cell.widthPct * factor * 100) / 100;
      }
      warnings.push(`Auto-fixed row widthPct sum from ${totalWidthPct} to 100`);
    } else if (Math.abs(totalWidthPct - 100) >= 10) {
      return { valid: false, warnings: [`Row widthPct sums to ${totalWidthPct}, expected 100`] };
    }
  }

  if (Math.abs(totalDepthPct - 100) > 0.1 && Math.abs(totalDepthPct - 100) < 10) {
    const factor = 100 / totalDepthPct;
    for (const row of layout.rows) {
      row.depthPct = Math.round(row.depthPct * factor * 100) / 100;
    }
    warnings.push(`Auto-fixed depthPct sum from ${totalDepthPct} to 100`);
  } else if (Math.abs(totalDepthPct - 100) >= 10) {
    return { valid: false, warnings: [`depthPct sums to ${totalDepthPct}, expected 100`] };
  }

  return { valid: true, warnings };
};

/* ── Main export ─────────────────────────────────────────────────────── */

export const generateLayoutWithLlm = async (
  portion: PortionPlanSpec,
  numVariants: number = 3,
  timeoutMs: number = 30000
): Promise<LlmLayoutResult> => {
  const provider = resolveProvider();
  const model = resolveModel(provider);
  console.log(`[LLM] Provider: ${provider}, Model: ${model}`);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(portion, numVariants);
  const warnings: string[] = [];

  const roomIds = new Set(portion.rooms.map((r) => r.id));

  try {
    const content =
      provider === "gemini"
        ? await callGemini(systemPrompt, userPrompt, timeoutMs)
        : await callOpenAI(systemPrompt, userPrompt, timeoutMs);

    console.log("[LLM] Raw response received, parsing...");
    const parsed = tryParseJson(content) as any;

    if (!parsed.layouts || !Array.isArray(parsed.layouts)) {
      throw new Error("LLM response missing 'layouts' array");
    }

    // Validate each layout
    const validLayouts: LlmLayoutPlan[] = [];
    for (let i = 0; i < parsed.layouts.length; i++) {
      const layout = parsed.layouts[i];
      const { valid, warnings: vw } = validateLayout(layout, roomIds, portion.boundaryFt.width, portion.boundaryFt.length);
      warnings.push(...vw.map((w: string) => `Variant ${i + 1}: ${w}`));
      if (valid) {
        validLayouts.push({
          variant: layout.variant || i + 1,
          rows: layout.rows,
        });
      }
    }

    if (validLayouts.length === 0) {
      throw new Error("No valid layouts from LLM after validation");
    }

    console.log(`[LLM] ${validLayouts.length} valid layouts produced`);
    return { layouts: validLayouts, provider, model, warnings };
  } catch (error: any) {
    console.error(`[LLM] Error: ${error.message}`);
    throw error;
  }
};
