import crypto from "crypto";
import {
  FLOORPLAN_CONTRACT_VERSION,
  GeneratePlanRequest,
  HousePortionDetails,
  NormalizedGeneratePlanRequest,
  RoomConstraints,
  SizeWithUnit,
} from "./contracts";
import {
  DEFAULT_CONSTRUCTION_RULES,
  DEFAULT_ROOM_CONSTRAINTS_1BHK,
  DEFAULT_ROOM_CONSTRAINTS_2BHK,
  DEFAULT_ROOM_CONSTRAINTS_3BHK,
  DEFAULT_STAIRCASE,
  DEFAULT_VASTU_PREFERENCE,
} from "./defaults";

const asNumber = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const convertLengthToFt = (
  value: SizeWithUnit | null | undefined,
  warnings: string[],
  fieldName: string
): number => {
  if (!value) throw new Error(`${fieldName} is required`);
  const size = asNumber(value.size);
  if (size === null || size <= 0) throw new Error(`${fieldName}.size must be > 0`);

  const unit = (value.unit || "").toLowerCase();
  if (unit === "ft") return size;
  if (unit === "meters" || unit === "m" || unit === "meter") return size * 3.28084;

  if (unit === "sq.ft" || unit === "sqft") {
    warnings.push(
      `${fieldName}.unit was '${value.unit}' and interpreted as 'ft' for backward compatibility.`
    );
    return size;
  }

  warnings.push(`${fieldName}.unit '${value.unit}' not recognized, interpreted as ft.`);
  return size;
};

export const convertAreaToFt2 = (
  value: SizeWithUnit | null | undefined,
  warnings: string[]
): number | null => {
  if (!value) return null;
  const size = asNumber(value.size);
  if (size === null || size <= 0) return null;
  const unit = (value.unit || "").toLowerCase();
  if (unit === "sq.ft" || unit === "sqft") return size;
  if (unit === "sq.meter" || unit === "sq meters" || unit === "m2") return size * 10.7639;
  if (unit === "ft") {
    warnings.push("total_area.unit was 'ft'; interpreted as sq.ft for compatibility.");
    return size;
  }
  warnings.push(`total_area.unit '${value.unit}' not recognized; interpreted as sq.ft.`);
  return size;
};

const mergeRoomConstraints = (
  base: RoomConstraints,
  override?: Partial<RoomConstraints>
): RoomConstraints => {
  if (!override) return base;
  return {
    living: { ...base.living, ...override.living },
    dining: { ...base.dining, ...override.dining },
    kitchen: { ...base.kitchen, ...override.kitchen },
    bedroom: { ...base.bedroom, ...override.bedroom },
    bathroom: { ...base.bathroom, ...override.bathroom },
    wc: { ...base.wc, ...override.wc },
    pooja: { ...base.pooja, ...override.pooja },
    guest_room: { ...base.guest_room, ...override.guest_room },
    balcony: { ...base.balcony, ...override.balcony },
  };
};

const estimateBhk = (floors: Array<{ portionDetails?: HousePortionDetails[] }>): 1 | 2 | 3 => {
  const maxBedrooms = floors.reduce((max, floor) => {
    const localMax = (floor.portionDetails || []).reduce(
      (a, p) => Math.max(a, Math.max(0, Number(p.bedrooms) || 0)),
      0
    );
    return Math.max(max, localMax);
  }, 1);

  if (maxBedrooms >= 3) return 3;
  if (maxBedrooms >= 2) return 2;
  return 1;
};

export const normalizeGeneratePlanRequest = (
  input: GeneratePlanRequest
): { normalized: NormalizedGeneratePlanRequest; warnings: string[]; requestHash: string } => {
  if (!input || typeof input !== "object") throw new Error("Request body must be an object");
  if (input.construction_scope !== "House") {
    throw new Error("Only construction_scope=House is supported for floor plan generation");
  }

  const warnings: string[] = [];

  const hci = input.house_construction_info;
  if (!hci) throw new Error("house_construction_info is required");

  const widthFt = convertLengthToFt(hci.width, warnings, "width");
  const lengthFt = convertLengthToFt(hci.length, warnings, "length");
  const boundaryAreaFt2 = widthFt * lengthFt;

  const declaredTotalAreaFt2 = convertAreaToFt2(hci.total_area, warnings);
  if (declaredTotalAreaFt2 !== null && declaredTotalAreaFt2 > boundaryAreaFt2) {
    warnings.push(
      `total_area (${declaredTotalAreaFt2.toFixed(2)} sq.ft) exceeds rectangle area (${boundaryAreaFt2.toFixed(2)} sq.ft). Using boundary dimensions as source of truth and scaling targets.`
    );
  }

  const bhk = estimateBhk(hci.floors || []);
  const defaultRoomConstraints =
    bhk === 3
      ? DEFAULT_ROOM_CONSTRAINTS_3BHK
      : bhk === 2
        ? DEFAULT_ROOM_CONSTRAINTS_2BHK
        : DEFAULT_ROOM_CONSTRAINTS_1BHK;

  const generateVariants = Math.max(1, Math.min(10, Number(input.generateVariants) || 3));

  const normalized: NormalizedGeneratePlanRequest = {
    ...input,
    schemaVersion: input.schemaVersion || FLOORPLAN_CONTRACT_VERSION,
    plotBoundary: input.plotBoundary || {
      shape: "RECTANGLE",
      width: { size: widthFt, unit: "ft" },
      length: { size: lengthFt, unit: "ft" },
    },
    vastuPreference: input.vastuPreference || DEFAULT_VASTU_PREFERENCE,
    roomConstraints: mergeRoomConstraints(defaultRoomConstraints, input.roomConstraints),
    constructionRules: {
      ...DEFAULT_CONSTRUCTION_RULES,
      ...(input.constructionRules || {}),
    },
    staircase: {
      ...DEFAULT_STAIRCASE,
      ...(input.staircase || {}),
    },
    portionAreaDistribution: input.portionAreaDistribution || {
      mode: "EQUAL",
    },
    tolerance: {
      areaTolerancePct: Math.max(1, Math.min(20, input.tolerance?.areaTolerancePct || 5)),
    },
    generateVariants,
  };

  if ((hci.floors || []).length > 3) {
    warnings.push("More than 3 floors requested; currently optimizing floor 0 fully and treating upper floors as future support.");
  }

  if ((hci.floors || []).length === 0) {
    throw new Error("At least one floor is required in house_construction_info.floors");
  }

  const llmProvider = (process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "openai")).toLowerCase();
  const llmModel = process.env.LLM_MODEL || (llmProvider === "gemini" ? "gemini-1.5-flash" : "gpt-4.1-mini");
  const key = JSON.stringify({
    normalized,
    seed: normalized.seed ?? null,
    llmProvider,
    llmModel,
    pipelineVersion: "v2",
  });
  const requestHash = crypto.createHash("sha256").update(key).digest("hex");

  return { normalized, warnings, requestHash };
};
