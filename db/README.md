# Banco de dados (PostgreSQL)

Arquivos de migracao:
- db/migrations/000_create_database.sql
- db/migrations/001_init.sql
- db/migrations/003_media_assets.sql
- db/migrations/004_specialist_description.sql
- db/migrations/005_schema_full_sync.sql

## Como aplicar

1) Criar o banco:

```
psql -U postgres -f db/migrations/000_create_database.sql
```

2) Aplicar o schema:

```
psql -U postgres -d studio_tatto -f db/migrations/001_init.sql
psql -U postgres -d studio_tatto -f db/migrations/003_media_assets.sql
psql -U postgres -d studio_tatto -f db/migrations/004_specialist_description.sql
psql -U postgres -d studio_tatto -f db/migrations/005_schema_full_sync.sql
```

## Observacoes
- O schema foi modelado para cobrir hero, curso, portfolio, especialistas, avaliacoes, contatos, localizacao, links e submits.
- Use a tabela app.site como registro principal do site e relacione o restante por site_id.
