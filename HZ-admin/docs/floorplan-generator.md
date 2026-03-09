# Floorplan Generator (LLM JSON -> CP-SAT -> SVG)

## Overview
Implemented pipeline:
1. Frontend sends `GeneratePlanRequest` JSON (`propertyInformation` + defaults).
2. Backend validates/defaults/normalizes units and expands room program.
3. LLM generates/refines `PlanSpec` JSON only.
4. Python solver (FastAPI + OR-Tools + Shapely) returns `PlacedPlan` variants.
5. Frontend renders interactive SVG and supports SVG/PNG/PDF export.

This workspace is Next.js only, so backend APIs are implemented as Next API routes with contracts ready to move into NestJS modules.

## Contracts
Source: `src/lib/floorplan/contracts.ts`

Versioned schemas:
- `GeneratePlanRequest`
- `PlanSpec`
- `PlacedPlan`

Key defaults and validations:
- `vastuPreference`: default `BALANCED`
- `constructionRules`: wall/passage/door/window defaults
- `staircase`: default `DOGLEG`, width 3.5ft
- `portionAreaDistribution`: default `EQUAL`
- `tolerance.areaTolerancePct`: default 5
- `generateVariants`: default 3, max 10
- `length/width` unit compatibility: if `sq.ft`, interpreted as `ft` with warnings
- `total_area > length*width`: boundary dimensions win, warning added
- multi-portion floors: per-portion boundary split is computed before solving (MVP split by width/length using gate side + aspect ratio)
- pre-solver area sanity: mandatory target area is checked against usable area (`circulationReserve`), then targets are scaled with warnings if needed

## Endpoints
- `POST /api/floorplans/generate`
  - Input: `GeneratePlanRequest`
  - Output: `{ planId, placedPlan, warnings[], meta }`
- `GET /api/floorplans/:planId`
  - Output: `{ planId, placedPlan }`

Legacy endpoint `POST /api/floor-plans` now returns `410` (deprecated).

## Solver Deployment (AWS same host)
Recommended runtime:
- Start Python solver locally on same instance/container:

```bash
cd python_solver
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

Nest/Node side calls: `http://127.0.0.1:8000/solve`.

## Persistence
- Postgres mode: set `DATABASE_URL`.
- Local fallback mode (for dev): `.data/floorplans.json`.
- SQL migration: `db/migrations/20260217_create_floor_plans.sql`.

## Environment Variables
- `LLM_PROVIDER=openai`
- `LLM_MODEL=gpt-4.1-mini`
- `OPENAI_API_KEY=...`
- `OPENAI_BASE_URL=https://api.openai.com/v1` (optional)
- `FLOORPLAN_SOLVER_URL=http://127.0.0.1:8000/solve`
- `DATABASE_URL=postgres://...` (optional, enables Postgres persistence)

## Curl Examples
Generate:

```bash
curl -X POST http://localhost:3000/api/floorplans/generate \
  -H "Content-Type: application/json" \
  -d @sample-generate-plan-request.json
```

Fetch by plan id:

```bash
curl http://localhost:3000/api/floorplans/<planId>
```

## Frontend Integration
Updated file:
- `src/features/CustomBuilder/customerOnBoarding/SummaryDetails/index.tsx`

Behavior:
- Uses existing `propertyInformation` data.
- Calls `/api/floorplans/generate`.
- Displays staged loading (`AI planning -> solving -> rendering`).
- SVG viewer opens in modal.
- Renders variants and interactive SVG via:
  - `src/features/CustomBuilder/customerOnBoarding/SummaryDetails/components/FloorPlanSvgViewer.tsx`
- Adds boundary dimension lines (top width, right height), tick marks, and ft labels.
- Exports: SVG, PNG, PDF.

## Constraints Implemented
Solver (`python_solver/solver.py`):
- Inside boundary
- No overlap (`AddNoOverlap2D`)
- Min dimensions and bounded area tolerance objective
- Compactness objective (`maxX + maxY`) to avoid long edge-chains
- Center packing objective (centroid distance to boundary center)
- Adjacency distance objective from explicit/default adjacency edges
- Entry objective: living room near gate-side entry point
- Vastu scoring (strictness-aware)
- Optional room dropping when infeasible
- Progressive relaxation of area tolerance before heuristic fallback
- Shapely post-validation for overlap/containment
- Heuristic fallback if CP-SAT infeasible
- Variant output includes `scoreBreakdown` (`compactnessScore`, `adjacencyScore`, `vastuScore`, `totalScore`) and `usedFootprint` (`maxX`, `maxY`, `utilizationPct`)

## Tests
TypeScript tests:
- `src/lib/floorplan/tests/normalize.test.ts` (DTO/default/unit validation)
- `src/lib/floorplan/tests/llm-parse.test.ts` (LLM JSON schema parsing)
- `src/lib/floorplan/tests/golden.test.ts` (golden structure)

Python tests:
- `python_solver/tests/test_solver_schema.py` (solver response schema + golden structure)

Run:

```bash
npm run test:floorplan
npm run test:solver
```

## TODO Hooks
- Async queue with BullMQ + Redis for high throughput
- Full multi-floor optimization (currently floor-0 optimized first pattern)
- More detailed connectivity constraints for doors/hallway graph
- Polygon plot constraints (contract already supports optional polygon input)
