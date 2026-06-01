BEGIN;

CREATE TABLE IF NOT EXISTS app.jewelry_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12, 2) NOT NULL DEFAULT 0,
  sku text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.jewelry_photo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES app.jewelry_item(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.jewelry_order (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  email text,
  phone text,
  delivery_method text NOT NULL DEFAULT 'delivery',
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  notes text,
  status app.submission_status NOT NULL DEFAULT 'new',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.jewelry_order_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES app.jewelry_order(id) ON DELETE CASCADE,
  jewelry_item_id uuid REFERENCES app.jewelry_item(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(12, 2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS jewelry_item_site_idx ON app.jewelry_item (site_id, created_at);
CREATE INDEX IF NOT EXISTS jewelry_photo_item_idx ON app.jewelry_photo (item_id, sort_order);
CREATE INDEX IF NOT EXISTS jewelry_order_site_idx ON app.jewelry_order (site_id, submitted_at);
CREATE INDEX IF NOT EXISTS jewelry_order_item_order_idx ON app.jewelry_order_item (order_id);

COMMIT;
