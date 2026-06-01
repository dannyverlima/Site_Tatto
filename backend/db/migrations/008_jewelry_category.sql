BEGIN;

ALTER TABLE app.jewelry_item
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'geral';

COMMIT;
