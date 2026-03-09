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
CREATE INDEX IF NOT EXISTS floor_plans_created_at_idx ON floor_plans(created_at DESC);
