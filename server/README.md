# API local (PostgreSQL)

Esta API conecta o site ao banco PostgreSQL.

## Configuracao

Crie um arquivo `server/.env` com os dados do Postgres:

```
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=COLOQUE_SUA_SENHA
PGDATABASE=studio_tatto
PORT=5175
```

## Executar

No terminal:

```
pnpm install
pnpm dev:server
```

E em outro terminal:

```
pnpm dev
```

## Endpoints

- GET /api/site-config
- PUT /api/site-config
