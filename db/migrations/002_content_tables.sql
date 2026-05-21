-- Specialists Table
CREATE TABLE app.specialists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  experience VARCHAR(255) NOT NULL,
  instagram VARCHAR(255),
  whatsapp VARCHAR(20),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  site_id INTEGER NOT NULL REFERENCES app.sites(id) ON DELETE CASCADE
);

-- Portfolio Table (Catálogo)
CREATE TABLE app.portfolio (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  style VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  site_id INTEGER NOT NULL REFERENCES app.sites(id) ON DELETE CASCADE
);

-- Course Table
CREATE TABLE app.course (
  id SERIAL PRIMARY KEY,
  description TEXT,
  next_class VARCHAR(255),
  price VARCHAR(100),
  price_note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  site_id INTEGER NOT NULL REFERENCES app.sites(id) ON DELETE CASCADE,
  UNIQUE(site_id)
);

-- Course Features Table
CREATE TABLE app.course_features (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Highlights Table
CREATE TABLE app.course_highlights (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  highlight TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Extra Info Table
CREATE TABLE app.course_extra_info (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  info TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images Table (for admin control)
CREATE TABLE app.images (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'hero', 'logo', 'background', etc.
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  site_id INTEGER NOT NULL REFERENCES app.sites(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_specialists_site_id ON app.specialists(site_id);
CREATE INDEX idx_portfolio_site_id ON app.portfolio(site_id);
CREATE INDEX idx_course_site_id ON app.course(site_id);
CREATE INDEX idx_course_features_course_id ON app.course_features(course_id);
CREATE INDEX idx_course_highlights_course_id ON app.course_highlights(course_id);
CREATE INDEX idx_course_extra_info_course_id ON app.course_extra_info(course_id);
CREATE INDEX idx_images_site_id ON app.images(site_id);
CREATE INDEX idx_images_type ON app.images(type);

-- Create update trigger for specialists
CREATE OR REPLACE FUNCTION app.update_specialists_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER specialists_update_timestamp
BEFORE UPDATE ON app.specialists
FOR EACH ROW
EXECUTE FUNCTION app.update_specialists_timestamp();

-- Create update trigger for portfolio
CREATE OR REPLACE FUNCTION app.update_portfolio_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_update_timestamp
BEFORE UPDATE ON app.portfolio
FOR EACH ROW
EXECUTE FUNCTION app.update_portfolio_timestamp();

-- Create update trigger for course
CREATE OR REPLACE FUNCTION app.update_course_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_update_timestamp
BEFORE UPDATE ON app.course
FOR EACH ROW
EXECUTE FUNCTION app.update_course_timestamp();

-- Create update trigger for images
CREATE OR REPLACE FUNCTION app.update_images_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER images_update_timestamp
BEFORE UPDATE ON app.images
FOR EACH ROW
EXECUTE FUNCTION app.update_images_timestamp();
