BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS app;

CREATE TYPE app.hero_background_type AS ENUM ('image', 'video');
CREATE TYPE app.review_status AS ENUM ('published', 'pending', 'rejected');
CREATE TYPE app.submission_status AS ENUM ('new', 'in_progress', 'done', 'archived');
CREATE TYPE app.contact_kind AS ENUM ('phone', 'email', 'address', 'hours', 'whatsapp', 'instagram', 'facebook', 'other');
CREATE TYPE app.social_platform AS ENUM ('instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp', 'email', 'other');
CREATE TYPE app.link_placement AS ENUM ('header', 'footer', 'cta', 'other');

CREATE TABLE app.site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TABLE app.page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  meta_description text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_slug_not_empty CHECK (length(trim(slug)) > 0),
  CONSTRAINT page_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT page_site_slug_unique UNIQUE (site_id, slug)
);

CREATE TABLE app.hero (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  background_type app.hero_background_type NOT NULL,
  background_url text NOT NULL,
  headline text,
  subheadline text,
  cta_primary_label text,
  cta_primary_href text,
  cta_secondary_label text,
  cta_secondary_href text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hero_site_unique UNIQUE (site_id)
);

CREATE TABLE app.course (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  next_class text,
  price text,
  price_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT course_site_unique UNIQUE (site_id)
);

CREATE TABLE app.course_feature (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_feature_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE TABLE app.course_highlight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_highlight_text_not_empty CHECK (length(trim(text)) > 0)
);

CREATE TABLE app.course_extra_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_extra_text_not_empty CHECK (length(trim(text)) > 0)
);

-- specialist MUST be created BEFORE portfolio_item (FK dependency)
CREATE TABLE app.specialist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  experience text,
  instagram text,
  whatsapp text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT specialist_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TABLE app.portfolio_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  title text NOT NULL,
  style text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  specialist_id uuid REFERENCES app.specialist(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portfolio_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE TABLE app.review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating smallint NOT NULL,
  comment text NOT NULL,
  display_date text,
  status app.review_status NOT NULL DEFAULT 'pending',
  source text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT review_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE TABLE app.contact_submission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT contact_email_not_empty CHECK (length(trim(email)) > 0)
);

CREATE TABLE app.course_enrollment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT enrollment_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT enrollment_email_not_empty CHECK (length(trim(email)) > 0)
);

CREATE TABLE app.location (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  country text,
  postal_code text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  map_embed_url text,
  reference text,
  parking_info text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES app.location(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL,
  opens_at time,
  closes_at time,
  note text,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opening_hours_day_range CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT opening_hours_unique_day UNIQUE (location_id, day_of_week)
);

CREATE TABLE app.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  kind app.contact_kind NOT NULL,
  label text,
  value text NOT NULL,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_value_not_empty CHECK (length(trim(value)) > 0)
);

CREATE TABLE app.social_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  platform app.social_platform NOT NULL,
  label text,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT social_url_not_empty CHECK (length(trim(url)) > 0)
);

CREATE TABLE app.site_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  placement app.link_placement NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT link_label_not_empty CHECK (length(trim(label)) > 0),
  CONSTRAINT link_href_not_empty CHECK (length(trim(href)) > 0)
);

-- Media assets table (for uploaded images/videos)
CREATE TABLE app.media_asset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  filename text NOT NULL,
  mimetype text NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_site
BEFORE UPDATE ON app.site
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_page
BEFORE UPDATE ON app.page
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_hero
BEFORE UPDATE ON app.hero
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_course
BEFORE UPDATE ON app.course
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_portfolio_item
BEFORE UPDATE ON app.portfolio_item
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_specialist
BEFORE UPDATE ON app.specialist
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_review
BEFORE UPDATE ON app.review
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_contact_submission
BEFORE UPDATE ON app.contact_submission
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_course_enrollment
BEFORE UPDATE ON app.course_enrollment
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_location
BEFORE UPDATE ON app.location
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_contact_info
BEFORE UPDATE ON app.contact_info
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_social_link
BEFORE UPDATE ON app.social_link
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_site_link
BEFORE UPDATE ON app.site_link
FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Indexes
CREATE INDEX site_page_site_idx ON app.page (site_id);
CREATE INDEX hero_site_idx ON app.hero (site_id);
CREATE INDEX course_site_idx ON app.course (site_id);
CREATE INDEX course_feature_course_idx ON app.course_feature (course_id, sort_order);
CREATE INDEX course_highlight_course_idx ON app.course_highlight (course_id, sort_order);
CREATE INDEX course_extra_course_idx ON app.course_extra_info (course_id, sort_order);
CREATE INDEX portfolio_site_idx ON app.portfolio_item (site_id, sort_order);
CREATE INDEX specialist_site_idx ON app.specialist (site_id, sort_order);
CREATE INDEX review_site_status_idx ON app.review (site_id, status, submitted_at DESC);
CREATE INDEX contact_submission_site_status_idx ON app.contact_submission (site_id, status, submitted_at DESC);
CREATE INDEX course_enrollment_course_status_idx ON app.course_enrollment (course_id, status, submitted_at DESC);
CREATE INDEX location_site_idx ON app.location (site_id);
CREATE INDEX opening_hours_location_idx ON app.opening_hours (location_id, day_of_week);
CREATE INDEX contact_info_site_kind_idx ON app.contact_info (site_id, kind, sort_order);
CREATE INDEX social_link_site_platform_idx ON app.social_link (site_id, platform, sort_order);
CREATE INDEX site_link_site_placement_idx ON app.site_link (site_id, placement, sort_order);
CREATE INDEX media_asset_site_idx ON app.media_asset (site_id, created_at DESC);

COMMIT;
