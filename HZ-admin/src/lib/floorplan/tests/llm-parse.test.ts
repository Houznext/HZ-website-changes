import test from "node:test";
import assert from "node:assert/strict";
import type { LlmLayoutPlan } from "../llm";

test("LlmLayoutPlan type validates grid structure", () => {
  const layout: LlmLayoutPlan = {
    variant: 1,
    rows: [
      {
        depthPct: 58,
        cells: [
          { roomId: "bathroom_0", widthPct: 15 },
          { roomId: "bedroom_0", widthPct: 35 },
          { roomId: "bedroom_1", widthPct: 35 },
          { roomId: "bathroom_1", widthPct: 15 },
        ],
      },
      {
        depthPct: 42,
        cells: [
          { roomId: "kitchen_0", widthPct: 30 },
          { roomId: "living_0", widthPct: 70 },
        ],
      },
    ],
  };

  assert.equal(layout.rows.length, 2);
  assert.equal(layout.rows[0].cells.length, 4);
  assert.equal(layout.rows[1].cells.length, 2);

  const totalDepth = layout.rows.reduce((s, r) => s + r.depthPct, 0);
  assert.equal(totalDepth, 100);

  for (const row of layout.rows) {
    const totalWidth = row.cells.reduce((s, c) => s + c.widthPct, 0);
    assert.equal(totalWidth, 100);
  }
});
