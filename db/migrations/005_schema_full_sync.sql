BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS app;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'hero_background_type' AND n.nspname = 'app') THEN
    CREATE TYPE app.hero_background_type AS ENUM ('image', 'video');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'review_status' AND n.nspname = 'app') THEN
    CREATE TYPE app.review_status AS ENUM ('published', 'pending', 'rejected');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'submission_status' AND n.nspname = 'app') THEN
    CREATE TYPE app.submission_status AS ENUM ('new', 'in_progress', 'done', 'archived');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'contact_kind' AND n.nspname = 'app') THEN
    CREATE TYPE app.contact_kind AS ENUM ('phone', 'email', 'address', 'hours', 'whatsapp', 'instagram', 'facebook', 'other');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'social_platform' AND n.nspname = 'app') THEN
    CREATE TYPE app.social_platform AS ENUM ('instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp', 'email', 'other');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'link_placement' AND n.nspname = 'app') THEN
    CREATE TYPE app.link_placement AS ENUM ('header', 'footer', 'cta', 'other');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS app.site (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.hero (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  background_type app.hero_background_type NOT NULL DEFAULT 'image',
  background_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hero_site_unique UNIQUE (site_id)
);

CREATE TABLE IF NOT EXISTS app.course (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Curso de Tatuagem',
  description text NOT NULL DEFAULT '',
  next_class text,
  price text,
  price_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_site_unique UNIQUE (site_id)
);

CREATE TABLE IF NOT EXISTS app.course_feature (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.course_highlight (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.course_extra_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.specialist (
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
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.portfolio_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  title text NOT NULL,
  style text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  specialist_id uuid REFERENCES app.specialist(id),
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text NOT NULL,
  rating smallint NOT NULL,
  comment text NOT NULL,
  display_date text,
  status app.review_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.contact_submission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.course_enrollment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  status app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.location (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  country text,
  postal_code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  map_embed_url text,
  reference text,
  parking_info text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.opening_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES app.location(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL,
  opens_at time,
  closes_at time,
  note text,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  kind app.contact_kind NOT NULL,
  label text,
  value text,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.social_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  platform app.social_platform NOT NULL,
  label text,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.site_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  placement app.link_placement NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.media_asset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  filename text NOT NULL,
  mimetype text NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app.specialist ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE app.portfolio_item ADD COLUMN IF NOT EXISTS specialist_id uuid REFERENCES app.specialist(id);
ALTER TABLE app.portfolio_item ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS portfolio_site_idx ON app.portfolio_item (site_id, sort_order);
CREATE INDEX IF NOT EXISTS specialist_site_idx ON app.specialist (site_id, sort_order);
CREATE INDEX IF NOT EXISTS course_feature_idx ON app.course_feature (course_id, sort_order);
CREATE INDEX IF NOT EXISTS course_highlight_idx ON app.course_highlight (course_id, sort_order);
CREATE INDEX IF NOT EXISTS course_extra_info_idx ON app.course_extra_info (course_id, sort_order);
CREATE INDEX IF NOT EXISTS contact_info_idx ON app.contact_info (site_id, sort_order);
CREATE INDEX IF NOT EXISTS social_link_idx ON app.social_link (site_id, sort_order);
CREATE INDEX IF NOT EXISTS site_link_idx ON app.site_link (site_id, placement, sort_order);
CREATE INDEX IF NOT EXISTS media_asset_site_idx ON app.media_asset (site_id, created_at DESC);

COMMIT;
