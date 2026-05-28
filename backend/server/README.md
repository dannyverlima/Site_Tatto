# Backend - Studios Tatto

## Configuração

### 1. Base de Dados PostgreSQL

Certifique-se de que o PostgreSQL está instalado e a correr. Depois, crie a base de dados:

```bash
psql -U postgres -f db/migrations/000_create_database.sql
psql -U postgres -d studio_tatto -f db/migrations/001_init.sql
psql -U postgres -d studio_tatto -f db/seed.sql
```

### 2. Variáveis de Ambiente

O ficheiro `.env` na **raiz do projeto** (não em `server/`) é o que configura a ligação à base de dados:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=sua_senha
PGDATABASE=studio_tatto
PORT=5175
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar

Abra dois terminais:

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

O frontend abre em `http://localhost:5173` e faz proxy das chamadas `/api/*` para o backend em `http://localhost:5175`.

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Verificar se o servidor está ativo |
| GET | `/api/site` | Resumo do site |
| GET/PUT | `/api/site-config` | Configuração completa do site |
| GET | `/api/contact-info` | Informações de contacto |
| GET | `/api/location` | Localização e horários |
| GET | `/api/social-links` | Redes sociais |
| GET | `/api/site-links` | Links do site |
| GET/POST | `/api/reviews` | Avaliações |
| POST | `/api/contact-submissions` | Formulário de contacto |
| POST | `/api/course-enrollments` | Inscrições no curso |
| GET/POST/PUT/DELETE | `/api/specialists` | CRUD de especialistas |
| GET/POST/PUT/DELETE | `/api/portfolio` | CRUD de portfólio |
| GET/PUT | `/api/course` | Curso |
| POST/PUT/DELETE | `/api/course/features` | Features do curso |
| POST/PUT/DELETE | `/api/course/highlights` | Highlights do curso |
| POST/PUT/DELETE | `/api/course/extra-info` | Info extra do curso |
| POST/GET | `/api/uploads` | Upload de imagens/vídeos |
