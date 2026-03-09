import { promises as fs } from "fs";
import path from "path";
import { PlanSpec, PlacedPlan } from "./contracts";

interface PersistPayload {
  planId: string;
  requestHash: string;
  inputSnapshot: unknown;
  planSpec: PlanSpec;
  placedPlan: PlacedPlan;
  warnings: string[];
}

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "floorplans.json");

const ensureLocalStore = async () => {
  const dir = path.dirname(LOCAL_STORE_PATH);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(LOCAL_STORE_PATH);
  } catch {
    await fs.writeFile(LOCAL_STORE_PATH, "[]", "utf8");
  }
};

const readLocalStore = async (): Promise<any[]> => {
  await ensureLocalStore();
  const raw = await fs.readFile(LOCAL_STORE_PATH, "utf8");
  return JSON.parse(raw || "[]");
};

const writeLocalStore = async (rows: any[]): Promise<void> => {
  await ensureLocalStore();
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(rows, null, 2), "utf8");
};

const hasDatabaseUrl = () => Boolean(process.env.DATABASE_URL);
const useLocalOnly = () => process.env.FLOORPLAN_FORCE_LOCAL_STORE === "true";

const shouldUseDatabase = () => hasDatabaseUrl() && !useLocalOnly();

const getPgClient = async (): Promise<any> => {
  const moduleName = "pg";
  let Client: any;
  try {
    ({ Client } = await import(moduleName));
  } catch {
    throw new Error(
      "DATABASE_URL is set but package 'pg' is not installed. Run `npm install pg`."
    );
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
};

const createTableIfNeeded = async (client: any): Promise<void> => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS floor_plans (
      plan_id TEXT PRIMARY KEY,
      request_hash TEXT NOT NULL,
      input_snapshot JSONB NOT NULL,
      plan_spec JSONB NOT NULL,
      placed_plan JSONB NOT NULL,
      warnings JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS floor_plans_request_hash_idx ON floor_plans(request_hash);
  `);
};

export const persistFloorPlan = async (payload: PersistPayload): Promise<void> => {
  if (shouldUseDatabase()) {
    try {
      const client = await getPgClient();
      try {
        await createTableIfNeeded(client);
        await client.query(
          `
          INSERT INTO floor_plans(plan_id, request_hash, input_snapshot, plan_spec, placed_plan, warnings)
          VALUES($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb)
          ON CONFLICT (plan_id) DO NOTHING
          `,
          [
            payload.planId,
            payload.requestHash,
            JSON.stringify(payload.inputSnapshot),
            JSON.stringify(payload.planSpec),
            JSON.stringify(payload.placedPlan),
            JSON.stringify(payload.warnings),
          ]
        );
      } finally {
        await client.end();
      }
      return;
    } catch (error: any) {
      console.warn(`[floorplan.repository] DB write failed, using local store: ${error?.message}`);
    }
  }

  const rows = await readLocalStore();
  rows.unshift({ ...payload, createdAt: new Date().toISOString() });
  await writeLocalStore(rows.slice(0, 500));
};

export const findFloorPlanById = async (planId: string): Promise<PlacedPlan | null> => {
  if (shouldUseDatabase()) {
    try {
      const client = await getPgClient();
      try {
        await createTableIfNeeded(client);
        const res = await client.query(`SELECT placed_plan FROM floor_plans WHERE plan_id = $1`, [planId]);
        if (!res.rows?.length) return null;
        return res.rows[0].placed_plan as PlacedPlan;
      } finally {
        await client.end();
      }
    } catch (error: any) {
      console.warn(`[floorplan.repository] DB read by id failed, using local store: ${error?.message}`);
    }
  }

  const rows = await readLocalStore();
  const hit = rows.find((r) => r.planId === planId);
  return hit?.placedPlan || null;
};

export const findFloorPlanByHash = async (requestHash: string): Promise<PlacedPlan | null> => {
  if (shouldUseDatabase()) {
    try {
      const client = await getPgClient();
      try {
        await createTableIfNeeded(client);
        const res = await client.query(
          `SELECT placed_plan FROM floor_plans WHERE request_hash = $1 ORDER BY created_at DESC LIMIT 1`,
          [requestHash]
        );
        if (!res.rows?.length) return null;
        return res.rows[0].placed_plan as PlacedPlan;
      } finally {
        await client.end();
      }
    } catch (error: any) {
      console.warn(`[floorplan.repository] DB read by hash failed, using local store: ${error?.message}`);
    }
  }

  const rows = await readLocalStore();
  const hit = rows.find((r) => r.requestHash === requestHash);
  return hit?.placedPlan || null;
};
