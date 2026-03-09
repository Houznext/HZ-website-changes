import test from "node:test";
import assert from "node:assert/strict";
import { normalizeGeneratePlanRequest } from "../normalize";

const baseRequest: any = {
  schemaVersion: "1.0.0",
  construction_scope: "House",
  construction_type: "New",
  property_type: "Residential",
  house_construction_info: {
    total_area: { size: 900, unit: "sq.ft" },
    length: { size: 30, unit: "sq.ft" },
    width: { size: 20, unit: "sq.ft" },
    adjacent_roads: 1,
    land_facing: "East",
    total_floors: 1,
    gate_side: "East",
    staircase_gate: "South",
    additionOptions: [],
    floors: [
      {
        floor: "Ground Floor",
        portions: 1,
        type_of_portions: ["2BHK"],
        portionDetails: [
          {
            portionType: "2BHK",
            bedrooms: 2,
            bathrooms: 2,
            balconies: 1,
            indian_bathroom_required: false,
            additional_rooms: [],
          },
        ],
        ground_floor_details: [],
      },
    ],
  },
};

test("normalizes defaults and accepts length/width sq.ft compatibility", () => {
  const out = normalizeGeneratePlanRequest(baseRequest);
  assert.equal(out.normalized.vastuPreference, "BALANCED");
  assert.equal(out.normalized.generateVariants, 3);
  assert.ok(out.warnings.some((w) => w.includes("interpreted as 'ft'")));
});

test("warns on total area mismatch larger than boundary", () => {
  const req = {
    ...baseRequest,
    house_construction_info: {
      ...baseRequest.house_construction_info,
      total_area: { size: 10000, unit: "sq.ft" },
    },
  };
  const out = normalizeGeneratePlanRequest(req);
  assert.ok(out.warnings.some((w) => w.includes("source of truth")));
});
