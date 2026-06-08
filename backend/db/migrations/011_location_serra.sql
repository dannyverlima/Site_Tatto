BEGIN;

-- Insere ou atualiza a localização do estúdio
-- Rodovia Governador Mário Covas, 1062 – S Geraldo, Serra ES, 29166-095

DO $$
DECLARE
  v_site_id uuid;
  v_location_id uuid;
BEGIN
  -- Pega o site_id (primeiro site cadastrado)
  SELECT id INTO v_site_id FROM app.site ORDER BY created_at LIMIT 1;

  IF v_site_id IS NULL THEN
    RAISE NOTICE 'Nenhum site encontrado. Execute a migration 001_init primeiro.';
    RETURN;
  END IF;

  -- Verifica se já existe localização para esse site
  SELECT id INTO v_location_id FROM app.location WHERE site_id = v_site_id LIMIT 1;

  IF v_location_id IS NULL THEN
    -- Cria nova localização
    INSERT INTO app.location (
      site_id,
      name,
      address_line1,
      address_line2,
      city,
      state,
      country,
      postal_code,
      map_embed_url
    ) VALUES (
      v_site_id,
      'Markin Tattoo Studio',
      'Rodovia Governador Mário Covas, 1062',
      'S Geraldo',
      'Serra',
      'ES',
      'Brasil',
      '29166-095',
      'https://maps.google.com/maps?q=Rodovia+Governador+Mario+Covas,+1062,+S+Geraldo,+Serra,+ES,+29166-095,+Brasil&output=embed&hl=pt-BR'
    )
    RETURNING id INTO v_location_id;

    RAISE NOTICE 'Localização criada: %', v_location_id;
  ELSE
    -- Atualiza localização existente
    UPDATE app.location SET
      name           = 'Markin Tattoo Studio',
      address_line1  = 'Rodovia Governador Mário Covas, 1062',
      address_line2  = 'S Geraldo',
      city           = 'Serra',
      state          = 'ES',
      country        = 'Brasil',
      postal_code    = '29166-095',
      map_embed_url  = 'https://maps.google.com/maps?q=Rodovia+Governador+Mario+Covas,+1062,+S+Geraldo,+Serra,+ES,+29166-095,+Brasil&output=embed&hl=pt-BR'
    WHERE id = v_location_id;

    RAISE NOTICE 'Localização atualizada: %', v_location_id;
  END IF;
END;
$$;

COMMIT;
