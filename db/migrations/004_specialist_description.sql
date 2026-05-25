ALTER TABLE app.specialist
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
