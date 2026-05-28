-- LiveBuild schema (rebuild). Safe to re-run where noted.

CREATE SEQUENCE IF NOT EXISTS livebuild_project_code_seq START 1;

CREATE TABLE IF NOT EXISTS livebuild_customers (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  mobile        VARCHAR(20)  UNIQUE NOT NULL,
  email         VARCHAR(255),
  address       TEXT,
  otp_verified  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_projects (
  id                  SERIAL PRIMARY KEY,
  project_code        VARCHAR(20) UNIQUE NOT NULL
                      DEFAULT ('HZLB-' || LPAD(nextval('livebuild_project_code_seq')::TEXT, 4, '0')),
  name                VARCHAR(255) NOT NULL,
  customer_id         INT REFERENCES livebuild_customers(id),
  customer_mobile     VARCHAR(20) NOT NULL,
  property_type       VARCHAR(100),
  project_type        VARCHAR(100),
  site_manager        VARCHAR(255),
  address             TEXT,
  start_date          DATE,
  due_date            DATE,
  status              VARCHAR(20) DEFAULT 'progress',
  phase               VARCHAR(50) DEFAULT 'Design',
  pct_method          VARCHAR(20) DEFAULT 'hybrid',
  overall_pct         INT DEFAULT 0,
  pct_override        INT,
  pct_override_reason TEXT,
  hold_reason         TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_work_types (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100),
  description     TEXT,
  requires_photos BOOLEAN DEFAULT TRUE,
  status          VARCHAR(20) DEFAULT 'active',
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_rooms (
  id            SERIAL PRIMARY KEY,
  project_id    INT REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  room_type     VARCHAR(100),
  dimensions    VARCHAR(100),
  pct           INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'live',
  hold_reason   TEXT,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_room_work_types (
  id           SERIAL PRIMARY KEY,
  room_id      INT REFERENCES livebuild_rooms(id) ON DELETE CASCADE,
  work_type_id INT REFERENCES livebuild_work_types(id) ON DELETE CASCADE,
  pct          INT DEFAULT 0,
  status       VARCHAR(20) DEFAULT 'not_started',
  UNIQUE(room_id, work_type_id)
);

CREATE TABLE IF NOT EXISTS livebuild_dpr (
  id           SERIAL PRIMARY KEY,
  project_id   INT REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  room_id      INT REFERENCES livebuild_rooms(id) ON DELETE CASCADE,
  work_type_id INT REFERENCES livebuild_work_types(id) ON DELETE CASCADE,
  report_date  DATE NOT NULL,
  pct_today    INT,
  notes        TEXT,
  done_today   BOOLEAN DEFAULT FALSE,
  submitted_by VARCHAR(255),
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_dpr_photos (
  id            SERIAL PRIMARY KEY,
  dpr_id        INT REFERENCES livebuild_dpr(id) ON DELETE CASCADE,
  file_url      TEXT NOT NULL,
  file_name     VARCHAR(255),
  file_size     INT,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_payments (
  id            SERIAL PRIMARY KEY,
  project_id    INT REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  label         VARCHAR(255) NOT NULL,
  pct           NUMERIC(5,2) NOT NULL,
  due_date      DATE,
  status        VARCHAR(20) DEFAULT 'upcoming',
  paid_date     DATE,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_queries (
  id            SERIAL PRIMARY KEY,
  project_id    INT REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  room_id       INT REFERENCES livebuild_rooms(id),
  query_code    VARCHAR(20),
  customer_name VARCHAR(255),
  subject       VARCHAR(500) NOT NULL,
  message       TEXT NOT NULL,
  status        VARCHAR(20) DEFAULT 'open',
  reply         TEXT,
  replied_at    TIMESTAMP,
  replied_by    VARCHAR(255),
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_documents (
  id                SERIAL PRIMARY KEY,
  project_id        INT REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  room_id           INT REFERENCES livebuild_rooms(id),
  name              VARCHAR(500) NOT NULL,
  category          VARCHAR(50) NOT NULL,
  related_work_type VARCHAR(255),
  file_url          TEXT NOT NULL,
  file_name         VARCHAR(255),
  file_size         INT,
  expiry_date       DATE,
  uploaded_by       VARCHAR(255),
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_materials (
  id              SERIAL PRIMARY KEY,
  project_id      INT REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  room_id         INT REFERENCES livebuild_rooms(id),
  work_type_id    INT REFERENCES livebuild_work_types(id),
  name            VARCHAR(500) NOT NULL,
  category        VARCHAR(100),
  specification   TEXT,
  brand           VARCHAR(255),
  quantity        NUMERIC(10,2),
  unit            VARCHAR(50),
  status          VARCHAR(30) DEFAULT 'not_started',
  install_date    DATE,
  warranty_period VARCHAR(50),
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS livebuild_property_info (
  id               SERIAL PRIMARY KEY,
  project_id       INT REFERENCES livebuild_projects(id) ON DELETE CASCADE UNIQUE,
  flat_number      VARCHAR(100),
  tower            VARCHAR(100),
  total_area_sqft  INT,
  carpet_area_sqft INT,
  balcony_sqft     INT,
  floor            VARCHAR(50),
  facing           VARCHAR(50),
  design_scope     TEXT,
  notes            TEXT
);

CREATE TABLE IF NOT EXISTS livebuild_otps (
  mobile      VARCHAR(20) PRIMARY KEY,
  otp         VARCHAR(10) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  attempts    INT DEFAULT 0
);

CREATE OR REPLACE FUNCTION update_project_pct() RETURNS TRIGGER AS $$
BEGIN
  UPDATE livebuild_projects
  SET overall_pct = (
    SELECT COALESCE(ROUND(AVG(pct)), 0)
    FROM livebuild_rooms
    WHERE project_id = NEW.project_id
  ), updated_at = NOW()
  WHERE id = NEW.project_id
    AND pct_override IS NULL
    AND (SELECT pct_method FROM livebuild_projects WHERE id = NEW.project_id) = 'hybrid';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_room_pct_change ON livebuild_rooms;
CREATE TRIGGER trg_room_pct_change
AFTER INSERT OR UPDATE OF pct ON livebuild_rooms
FOR EACH ROW EXECUTE FUNCTION update_project_pct();
