UPDATE app.location SET
  address_line2 = 'São Geraldo',
  map_embed_url = 'https://maps.google.com/maps?q=Rodovia+Governador+M%C3%A1rio+Covas%2C+1062%2C+S%C3%A3o+Geraldo%2C+Serra%2C+ES%2C+29166-095%2C+Brasil&output=embed&hl=pt-BR'
WHERE id = 'b1dbb6fb-561e-4326-87ef-c5a2f2080fcd';

UPDATE app.portfolio_item SET is_published = true WHERE is_published = false OR is_published IS NULL;
