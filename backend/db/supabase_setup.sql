-- ============================================================
--  SUPABASE SETUP — Studio Markin Tattoo
--  Cole este SQL inteiro no SQL Editor do Supabase e execute.
--  Cria toda a estrutura + dados iniciais do site.
-- ============================================================

-- ── Extensões ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Schema ───────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS app;

-- ── ENUMs ────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'hero_background_type' AND n.nspname = 'app') THEN
    CREATE TYPE app.hero_background_type AS ENUM ('image', 'video');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'review_status' AND n.nspname = 'app') THEN
    CREATE TYPE app.review_status AS ENUM ('published', 'pending', 'rejected');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'submission_status' AND n.nspname = 'app') THEN
    CREATE TYPE app.submission_status AS ENUM ('new', 'in_progress', 'done', 'archived');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'contact_kind' AND n.nspname = 'app') THEN
    CREATE TYPE app.contact_kind AS ENUM ('phone', 'email', 'address', 'hours', 'whatsapp', 'instagram', 'facebook', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'social_platform' AND n.nspname = 'app') THEN
    CREATE TYPE app.social_platform AS ENUM ('instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp', 'email', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'link_placement' AND n.nspname = 'app') THEN
    CREATE TYPE app.link_placement AS ENUM ('header', 'footer', 'cta', 'other');
  END IF;
END $$;

-- ── Trigger de updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── TABELAS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app.site (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  domain      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.page (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id          uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  slug             text NOT NULL,
  title            text NOT NULL,
  meta_description text,
  is_published     boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_site_slug_unique UNIQUE (site_id, slug)
);

CREATE TABLE IF NOT EXISTS app.hero (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id               uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  background_type       app.hero_background_type NOT NULL DEFAULT 'image',
  background_url        text NOT NULL DEFAULT '',
  headline              text,
  subheadline           text,
  cta_primary_label     text,
  cta_primary_href      text,
  cta_secondary_label   text,
  cta_secondary_href    text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hero_site_unique UNIQUE (site_id)
);

CREATE TABLE IF NOT EXISTS app.course (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT 'Curso de Tatuagem',
  description text NOT NULL DEFAULT '',
  next_class  text,
  price       text,
  price_note  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_site_unique UNIQUE (site_id)
);

CREATE TABLE IF NOT EXISTS app.course_feature (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.course_highlight (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  text       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.course_extra_info (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  text       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.specialist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id     uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name        text NOT NULL,
  specialty   text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url   text NOT NULL,
  experience  text,
  instagram   text,
  whatsapp    text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.portfolio_item (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  title         text NOT NULL,
  style         text NOT NULL DEFAULT '',
  image_url     text NOT NULL,
  specialist_id uuid REFERENCES app.specialist(id) ON DELETE SET NULL,
  sort_order    integer NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.review (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name         text NOT NULL,
  rating       smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      text NOT NULL,
  display_date text,
  status       app.review_status NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.contact_submission (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  message      text NOT NULL,
  status       app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  handled_at   timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.course_enrollment (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    uuid NOT NULL REFERENCES app.course(id) ON DELETE CASCADE,
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  message      text,
  status       app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  handled_at   timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.location (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name          text,
  address_line1 text,
  address_line2 text,
  city          text,
  state         text,
  country       text,
  postal_code   text,
  latitude      numeric(10, 7),
  longitude     numeric(10, 7),
  map_embed_url text,
  reference     text,
  parking_info  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.opening_hours (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  uuid NOT NULL REFERENCES app.location(id) ON DELETE CASCADE,
  day_of_week  smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at     time,
  closes_at    time,
  note         text,
  is_closed    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT opening_hours_unique_day UNIQUE (location_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS app.contact_info (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  kind       app.contact_kind NOT NULL,
  label      text,
  value      text,
  link_url   text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.social_link (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  platform   app.social_platform NOT NULL,
  label      text,
  url        text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.site_link (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  placement  app.link_placement NOT NULL,
  label      text NOT NULL,
  href       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Media: data é nullable (arquivos salvos em disco têm disk_path)
CREATE TABLE IF NOT EXISTS app.media_asset (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  filename      text NOT NULL,
  mimetype      text NOT NULL,
  data          bytea,
  disk_filename text,
  disk_path     text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Joalheria ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS app.jewelry_item (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id          uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text NOT NULL DEFAULT '',
  price            numeric(12, 2) NOT NULL DEFAULT 0,
  sku              text,
  stock            integer NOT NULL DEFAULT 0,
  discount_percent numeric(5, 2) NOT NULL DEFAULT 0,
  is_featured      boolean NOT NULL DEFAULT false,
  is_active        boolean NOT NULL DEFAULT true,
  category         text NOT NULL DEFAULT 'geral',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.jewelry_photo (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    uuid NOT NULL REFERENCES app.jewelry_item(id) ON DELETE CASCADE,
  image_url  text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.jewelry_order (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  customer_name   text NOT NULL,
  email           text,
  phone           text,
  delivery_method text NOT NULL DEFAULT 'delivery',
  address_line1   text,
  address_line2   text,
  city            text,
  state           text,
  postal_code     text,
  notes           text,
  payment_method  text NOT NULL DEFAULT 'dinheiro',
  pickup_date     text,
  status          text NOT NULL DEFAULT 'nulo',
  shipping_fee    numeric(12, 2) NOT NULL DEFAULT 0,
  total           numeric(12, 2) NOT NULL DEFAULT 0,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  paid_at         timestamptz,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.jewelry_order_item (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL REFERENCES app.jewelry_order(id) ON DELETE CASCADE,
  jewelry_item_id uuid REFERENCES app.jewelry_item(id) ON DELETE SET NULL,
  name            text NOT NULL,
  price           numeric(12, 2) NOT NULL,
  quantity        integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS app.jewelry_sale (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  order_id        uuid REFERENCES app.jewelry_order(id) ON DELETE SET NULL,
  jewelry_item_id uuid REFERENCES app.jewelry_item(id) ON DELETE SET NULL,
  item_name       text NOT NULL,
  unit_price      numeric(12, 2) NOT NULL,
  discount_percent numeric(5, 2) NOT NULL DEFAULT 0,
  quantity        integer NOT NULL DEFAULT 1,
  total_amount    numeric(12, 2) NOT NULL,
  sold_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.site_setting (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  key        text NOT NULL,
  value      text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, key)
);

-- ── Clientes da joalheria ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS app.jewelry_customer (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Tabela de controlo de migrations ─────────────────────────
CREATE TABLE IF NOT EXISTS app.migrations (
  name   text PRIMARY KEY,
  ran_at timestamptz DEFAULT now()
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS site_page_site_idx ON app.page (site_id);
CREATE INDEX IF NOT EXISTS hero_site_idx ON app.hero (site_id);
CREATE INDEX IF NOT EXISTS course_site_idx ON app.course (site_id);
CREATE INDEX IF NOT EXISTS course_feature_idx ON app.course_feature (course_id, sort_order);
CREATE INDEX IF NOT EXISTS course_highlight_idx ON app.course_highlight (course_id, sort_order);
CREATE INDEX IF NOT EXISTS course_extra_info_idx ON app.course_extra_info (course_id, sort_order);
CREATE INDEX IF NOT EXISTS portfolio_site_idx ON app.portfolio_item (site_id, sort_order);
CREATE INDEX IF NOT EXISTS specialist_site_idx ON app.specialist (site_id, sort_order);
CREATE INDEX IF NOT EXISTS review_site_status_idx ON app.review (site_id, status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS contact_submission_site_idx ON app.contact_submission (site_id, status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS course_enrollment_idx ON app.course_enrollment (course_id, status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS location_site_idx ON app.location (site_id);
CREATE INDEX IF NOT EXISTS opening_hours_location_idx ON app.opening_hours (location_id, day_of_week);
CREATE INDEX IF NOT EXISTS contact_info_idx ON app.contact_info (site_id, sort_order);
CREATE INDEX IF NOT EXISTS social_link_idx ON app.social_link (site_id, sort_order);
CREATE INDEX IF NOT EXISTS site_link_idx ON app.site_link (site_id, placement, sort_order);
CREATE INDEX IF NOT EXISTS media_asset_site_idx ON app.media_asset (site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS media_asset_disk_filename_idx ON app.media_asset (disk_filename);
CREATE INDEX IF NOT EXISTS jewelry_item_site_idx ON app.jewelry_item (site_id, created_at);
CREATE INDEX IF NOT EXISTS jewelry_photo_item_idx ON app.jewelry_photo (item_id, sort_order);
CREATE INDEX IF NOT EXISTS jewelry_order_site_idx ON app.jewelry_order (site_id, submitted_at);
CREATE INDEX IF NOT EXISTS jewelry_order_item_order_idx ON app.jewelry_order_item (order_id);
CREATE INDEX IF NOT EXISTS jewelry_sale_site_idx ON app.jewelry_sale (site_id, sold_at);
CREATE INDEX IF NOT EXISTS jewelry_sale_order_idx ON app.jewelry_sale (order_id);
CREATE INDEX IF NOT EXISTS site_setting_site_key_idx ON app.site_setting (site_id, key);
CREATE INDEX IF NOT EXISTS jewelry_customer_email_idx ON app.jewelry_customer (email);

-- ── Triggers de updated_at ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_site') THEN
    CREATE TRIGGER set_updated_at_site BEFORE UPDATE ON app.site FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_hero') THEN
    CREATE TRIGGER set_updated_at_hero BEFORE UPDATE ON app.hero FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_course') THEN
    CREATE TRIGGER set_updated_at_course BEFORE UPDATE ON app.course FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_specialist') THEN
    CREATE TRIGGER set_updated_at_specialist BEFORE UPDATE ON app.specialist FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_portfolio_item') THEN
    CREATE TRIGGER set_updated_at_portfolio_item BEFORE UPDATE ON app.portfolio_item FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_review') THEN
    CREATE TRIGGER set_updated_at_review BEFORE UPDATE ON app.review FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_contact_submission') THEN
    CREATE TRIGGER set_updated_at_contact_submission BEFORE UPDATE ON app.contact_submission FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_course_enrollment') THEN
    CREATE TRIGGER set_updated_at_course_enrollment BEFORE UPDATE ON app.course_enrollment FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_location') THEN
    CREATE TRIGGER set_updated_at_location BEFORE UPDATE ON app.location FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_contact_info') THEN
    CREATE TRIGGER set_updated_at_contact_info BEFORE UPDATE ON app.contact_info FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_social_link') THEN
    CREATE TRIGGER set_updated_at_social_link BEFORE UPDATE ON app.social_link FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_site_link') THEN
    CREATE TRIGGER set_updated_at_site_link BEFORE UPDATE ON app.site_link FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_jewelry_item') THEN
    CREATE TRIGGER set_updated_at_jewelry_item BEFORE UPDATE ON app.jewelry_item FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_jewelry_order') THEN
    CREATE TRIGGER set_updated_at_jewelry_order BEFORE UPDATE ON app.jewelry_order FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_site_setting') THEN
    CREATE TRIGGER set_updated_at_site_setting BEFORE UPDATE ON app.site_setting FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_jewelry_customer') THEN
    CREATE TRIGGER set_updated_at_jewelry_customer BEFORE UPDATE ON app.jewelry_customer FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
  END IF;
END $$;

-- ── Desabilitar Row Level Security (auth feita pelo backend) ──
ALTER TABLE app.site              DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.page              DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.hero              DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.course            DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.course_feature    DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.course_highlight  DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.course_extra_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.specialist        DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.portfolio_item    DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.review            DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.contact_submission DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.course_enrollment DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.location          DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.opening_hours     DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.contact_info      DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.social_link       DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.site_link         DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.media_asset       DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.jewelry_item      DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.jewelry_photo     DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.jewelry_order     DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.jewelry_order_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.jewelry_sale      DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.site_setting      DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.jewelry_customer  DISABLE ROW LEVEL SECURITY;
ALTER TABLE app.migrations        DISABLE ROW LEVEL SECURITY;

-- ── Dados iniciais (seed) ─────────────────────────────────────

INSERT INTO app.site (id, name, domain)
VALUES ('00000000-0000-0000-0000-000000000001', 'Markin Tattoo Studio', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO app.hero (site_id, background_type, background_url)
VALUES ('00000000-0000-0000-0000-000000000001', 'image', '')
ON CONFLICT (site_id) DO NOTHING;

INSERT INTO app.course (id, site_id, title, description, next_class, price, price_note)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Curso de Tatuagem Profissional',
  'Aprenda as técnicas mais avançadas de tatuagem com profissionais experientes.',
  'Em breve',
  'Consultar',
  ''
)
ON CONFLICT (site_id) DO NOTHING;

INSERT INTO app.location (
  site_id, name, address_line1, address_line2,
  city, state, country, postal_code, map_embed_url
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Markin Tattoo Studio',
  'Rodovia Governador Mário Covas, 1990',
  'São Geraldo',
  'Serra',
  'ES',
  'Brasil',
  '29166-095',
  'https://maps.google.com/maps?q=Rodovia+Governador+M%C3%A1rio+Covas%2C+1990%2C+S%C3%A3o+Geraldo%2C+Serra%2C+ES%2C+29166-095%2C+Brasil&output=embed&hl=pt-BR'
)
ON CONFLICT DO NOTHING;

-- Marcar todas as migrations como já executadas (estrutura criada acima)
INSERT INTO app.migrations (name) VALUES
  ('000_create_database.sql'),
  ('001_init.sql'),
  ('005_schema_full_sync.sql'),
  ('006_jewelry_store.sql'),
  ('007_jewelry_extended.sql'),
  ('008_jewelry_category.sql'),
  ('009_user_auth.sql'),
  ('010_fix_media_asset_data.sql'),
  ('011_location_serra.sql'),
  ('012_fix_disk_paths.sql')
ON CONFLICT DO NOTHING;
