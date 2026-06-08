-- Project cover image and 3D panorama URL for customer portal
ALTER TABLE livebuild_projects
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS panorama_url TEXT;
