-- ============================================================
-- Script completo de setup da base de dados Studio Tatto
-- Execute com: psql -U postgres -f db/setup.sql
-- ============================================================

-- 1. Criar a base de dados (executar separadamente se necessário)
-- CREATE DATABASE studio_tatto WITH ENCODING 'UTF8' TEMPLATE template0;

-- 2. Conectar à base de dados studio_tatto e executar:
-- psql -U postgres -d studio_tatto -f db/migrations/001_init.sql

-- Ou execute tudo de uma vez com:
-- psql -U postgres -f db/migrations/000_create_database.sql
-- psql -U postgres -d studio_tatto -f db/migrations/001_init.sql
-- psql -U postgres -d studio_tatto -f db/seed.sql
