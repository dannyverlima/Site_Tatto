-- Tabela de clientes da joalheria (login/cadastro)
CREATE TABLE IF NOT EXISTS app.jewelry_customer (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jewelry_customer_email_idx ON app.jewelry_customer(email);
