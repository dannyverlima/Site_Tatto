-- ============================================================
-- Dados iniciais (seed) para o Studio Tatto
-- Execute com: psql -U postgres -d studio_tatto -f db/seed.sql
-- ============================================================

BEGIN;

-- Criar o site principal
INSERT INTO app.site (id, name, domain)
VALUES ('00000000-0000-0000-0000-000000000001', 'Studios Tatto', NULL)
ON CONFLICT DO NOTHING;

-- Configuração do Hero
INSERT INTO app.hero (site_id, background_type, background_url)
VALUES ('00000000-0000-0000-0000-000000000001', 'image', '')
ON CONFLICT (site_id) DO NOTHING;

-- Curso padrão
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

-- Localização padrão
INSERT INTO app.location (site_id, name, address_line1, city, state, country)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Studios Tatto',
  'Endereço a definir',
  'Cidade',
  'Estado',
  'Brasil'
);

COMMIT;
