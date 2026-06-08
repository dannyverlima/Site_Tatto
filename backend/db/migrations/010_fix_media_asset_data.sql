BEGIN;

-- Tornar coluna `data` nullable: arquivos já salvos em disco não precisam
-- ficar duplicados como BYTEA no banco (causava "invalid memory alloc" no pg_dump)
ALTER TABLE app.media_asset ALTER COLUMN data DROP NOT NULL;

-- Limpar os binários de registros que já têm caminho em disco
UPDATE app.media_asset
   SET data = NULL
 WHERE disk_path IS NOT NULL
   AND disk_path <> '';

COMMIT;
