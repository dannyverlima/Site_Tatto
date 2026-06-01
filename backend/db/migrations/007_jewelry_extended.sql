BEGIN;

-- Extend jewelry_item with stock, discount and featured flag
ALTER TABLE app.jewelry_item
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percent numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Add shipping fee and total to orders
ALTER TABLE app.jewelry_order
  ADD COLUMN IF NOT EXISTS shipping_fee numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Site settings (key-value store for configurable values like taxa de encomenda)
CREATE TABLE IF NOT EXISTS app.site_setting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, key)
);

-- Sales table for faturamento tracking
CREATE TABLE IF NOT EXISTS app.jewelry_sale (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES app.site(id) ON DELETE CASCADE,
  order_id uuid REFERENCES app.jewelry_order(id) ON DELETE SET NULL,
  jewelry_item_id uuid REFERENCES app.jewelry_item(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  discount_percent numeric(5,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  total_amount numeric(12,2) NOT NULL,
  sold_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jewelry_sale_site_idx ON app.jewelry_sale (site_id, sold_at);
CREATE INDEX IF NOT EXISTS jewelry_sale_order_idx ON app.jewelry_sale (order_id);
CREATE INDEX IF NOT EXISTS site_setting_site_key_idx ON app.site_setting (site_id, key);

COMMIT;
