-- LiveBuild admin notification preferences (single-row settings)

CREATE TABLE IF NOT EXISTS livebuild_admin_settings (
  id            SERIAL PRIMARY KEY,
  notifications JSONB NOT NULL DEFAULT '{"dpr":true,"query":true,"payment":true,"hold":false,"doc":true}'::jsonb,
  updated_at    TIMESTAMP DEFAULT NOW()
);

INSERT INTO livebuild_admin_settings (id, notifications)
VALUES (1, '{"dpr":true,"query":true,"payment":true,"hold":false,"doc":true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
