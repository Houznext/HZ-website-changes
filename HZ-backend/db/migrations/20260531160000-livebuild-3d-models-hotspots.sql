-- LiveBuild 3D models and room hotspots for interactive walkthrough
CREATE TABLE IF NOT EXISTS livebuild_3d_models (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES livebuild_projects(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  model_type VARCHAR(30) NOT NULL DEFAULT 'full_home',
  floor_number INT,
  room_id INT REFERENCES livebuild_rooms(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  file_format VARCHAR(20) DEFAULT 'glb',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  camera_pos_x DOUBLE PRECISION,
  camera_pos_y DOUBLE PRECISION,
  camera_pos_z DOUBLE PRECISION,
  camera_target_x DOUBLE PRECISION,
  camera_target_y DOUBLE PRECISION,
  camera_target_z DOUBLE PRECISION,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_livebuild_3d_models_project ON livebuild_3d_models(project_id);

CREATE TABLE IF NOT EXISTS livebuild_3d_hotspots (
  id SERIAL PRIMARY KEY,
  model_id INT NOT NULL REFERENCES livebuild_3d_models(id) ON DELETE CASCADE,
  room_id INT REFERENCES livebuild_rooms(id) ON DELETE SET NULL,
  label VARCHAR(255) NOT NULL,
  position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
  position_z DOUBLE PRECISION NOT NULL DEFAULT 0,
  camera_pos_x DOUBLE PRECISION,
  camera_pos_y DOUBLE PRECISION,
  camera_pos_z DOUBLE PRECISION,
  camera_target_x DOUBLE PRECISION,
  camera_target_y DOUBLE PRECISION,
  camera_target_z DOUBLE PRECISION,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_livebuild_3d_hotspots_model ON livebuild_3d_hotspots(model_id);
