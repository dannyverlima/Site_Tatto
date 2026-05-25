# Como deixar o site igual em outro computador

Este guia foi feito para que outra pessoa consiga abrir o projeto, restaurar o banco atual e ver o site funcionando igual ao seu ambiente.

## 1. Requisitos

- Node.js instalado
- pnpm instalado
- PostgreSQL instalado
- PgAdmin4 instalado

## 2. Baixar o projeto

1. Clone ou copie a pasta do repositório.
2. Abra o projeto no VS Code.

## 3. Configurar o `.env`

Crie um arquivo `.env` na raiz do projeto com os dados do PostgreSQL.

Exemplo:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=sua_senha
PGDATABASE=studio_tatto
PORT=5175
```

Se a senha do PostgreSQL for diferente, ajuste só o `PGPASSWORD`.

## 4. Criar o banco

No PgAdmin4:

1. Crie o banco `studio_tatto`.
2. Execute as migrações nesta ordem:
   - `db/migrations/000_create_database.sql`
   - `db/migrations/001_init.sql`
   - `db/migrations/002_content_tables.sql`
   - `db/migrations/003_media_assets.sql`
   - `db/migrations/004_specialist_description.sql`

## 5. Restaurar os dados atuais

Depois das migrações, restaure o arquivo [db/exports/studio_tatto_current.sql](db/exports/studio_tatto_current.sql).

No PgAdmin4, você pode:

1. Abrir o Query Tool no banco `studio_tatto`.
2. Carregar o arquivo SQL exportado.
3. Executar o script completo.

Esse arquivo traz os dados atuais do site, com exceção dos arquivos grandes de mídia.

## 6. Restaurar as mídias

Depois do SQL, rode o importador de mídia:

```bash
node scripts/import-media-assets.mjs
```

Esse passo recria os vídeos, imagens e demais arquivos salvos em `app.media_asset`.

## 7. Instalar dependências

Na raiz do projeto:

```bash
pnpm install
```

## 8. Subir o projeto

Use os dois serviços juntos:

```bash
pnpm dev:all
```

Se preferir separado:

```bash
pnpm dev
```

```bash
pnpm dev:server
```

## 9. Abrir as rotas

- Site principal: `http://localhost:5173/`
- Curso: `http://localhost:5173/curso.html`
- Admin: `http://localhost:5173/Admin@tatto`

## 10. O que precisa funcionar

- O hero precisa carregar imagem ou vídeo salvo no banco.
- O admin precisa salvar uploads sem perder o link ao trocar de aba.
- A página de especialista precisa mostrar nome, experiência, descrição e botões de contato.

## 11. Se der erro

- Confira se o PostgreSQL está rodando.
- Confirme se o `.env` aponta para o banco certo.
- Se a API estiver na porta 5175 e o site na 5173, está correto.

## 12. Observação importante

O arquivo de exportação do banco é o que deixa o site igual ao seu ambiente atual. Se ele for atualizado depois, gere um novo dump para manter tudo sincronizado.