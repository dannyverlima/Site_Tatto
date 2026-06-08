BEGIN;

-- Corrige disk_path: move de Site_Tatto\imagens para Site_Tatto\backend\imagens
UPDATE app.media_asset
   SET disk_path = REPLACE(
         disk_path,
         'Site_Tatto\imagens\',
         'Site_Tatto\backend\imagens\'
       )
 WHERE disk_path LIKE '%Site_Tatto\imagens\%'
   AND disk_path NOT LIKE '%Site_Tatto\backend\imagens\%';

-- Confirma quantos foram corrigidos
DO $$
DECLARE v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
    FROM app.media_asset
   WHERE disk_path LIKE '%Site_Tatto\backend\imagens\%';
  RAISE NOTICE 'Records with correct path after fix: %', v_count;
END;
$$;

COMMIT;
