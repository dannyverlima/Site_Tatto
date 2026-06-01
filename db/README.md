# Banco de dados (PostgreSQL)

Arquivos de migracao:
- db/migrations/000_create_database.sql
- db/migrations/001_init.sql
- db/migrations/005_schema_full_sync.sql
- db/migrations/006_jewelry_store.sql

## Como aplicar

1) Criar o banco:

```
psql -U postgres -f db/migrations/000_create_database.sql
```

2) Aplicar o schema:

```
psql -U postgres -d studio_tatto -f db/migrations/001_init.sql
psql -U postgres -d studio_tatto -f db/migrations/005_schema_full_sync.sql
psql -U postgres -d studio_tatto -f db/migrations/006_jewelry_store.sql
```

## Observacoes
- O schema foi modelado para cobrir hero, curso, portfolio, especialistas, avaliacoes, contatos, localizacao, links e submits.
- Use a tabela app.site como registro principal do site e relacione o restante por site_id.
