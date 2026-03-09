import test from "node:test";
import assert from "node:assert/strict";
import { normalizeGeneratePlanRequest } from "../normalize";
import { expandPlanProgram } from "../program-expander";

const sampleRequest: any = {
  schemaVersion: "1.0.0",
  id: 101,
  construction_type: "New",
  propertyName: "Golden Home",
  property_type: "Residential",
  construction_scope: "House",
  house_construction_info: {
    total_area: { size: 1200, unit: "sq.ft" },
    length: { size: 40, unit: "ft" },
    width: { size: 30, unit: "ft" },
    adjacent_roads: 2,
    land_facing: "East",
    total_floors: 1,
    gate_side: "East",
    staircase_gate: "South",
    additionOptions: ["Parking"],
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
            indian_bathroom_required: true,
            additional_rooms: ["pooja_room"],
          },
        ],
        ground_floor_details: ["parking", "staircase"],
      },
    ],
  },
};

test("golden contract output has expected structure", () => {
  const { normalized, requestHash } = normalizeGeneratePlanRequest(sampleRequest);
  const { planSpecBase } = expandPlanProgram(normalized, requestHash, 9);

  assert.equal(planSpecBase.schemaVersion, "1.0.0");
  assert.ok(planSpecBase.requestHash.length > 10);
  assert.ok(planSpecBase.portions.length >= 1);
  assert.ok(planSpecBase.portions[0].rooms.length >= 5);
});
