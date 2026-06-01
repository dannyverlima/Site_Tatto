# Studios Tatto - Site

Site profissional para estúdio de tatuagem com painel administrativo, portfólio, especialistas, curso e formulários de contacto.

Design original: https://www.figma.com/design/VoUMBtwXVHMNnO494d6IFq/Tattoo-Studio-Website-Design

## Tecnologias

- **Frontend:** React + Vite + TypeScript + TailwindCSS + Radix UI + MUI
- **Backend:** Node.js + Express
- **Base de Dados:** PostgreSQL

## Requisitos

- Node.js 18+ (recomendado 22+)
- PostgreSQL 14+
- npm ou pnpm

## Setup Rápido

### 1. Clonar o repositório

```bash
git clone https://github.com/dannyverlima/Site_Tatto.git
cd Site_Tatto
git checkout tudo
```

### 2. Configurar a base de dados

```bash
psql -U postgres -f db/migrations/000_create_database.sql
psql -U postgres -d studio_tatto -f db/migrations/001_init.sql
psql -U postgres -d studio_tatto -f db/seed.sql
```

### 3. Configurar variáveis de ambiente

Crie o ficheiro `.env` na raiz do projeto:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=sua_senha_aqui
PGDATABASE=studio_tatto
PORT=5175
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Executar

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Aceda ao site em: `http://localhost:5173`

## Estrutura do Projeto

```
Site_Tatto/
├── db/                    # Migrações e seed da base de dados
│   ├── migrations/
│   │   ├── 000_create_database.sql
│   │   └── 001_init.sql
│   └── seed.sql
├── server/                # Backend (Express + PostgreSQL)
│   ├── db.mjs            # Conexão ao PostgreSQL
│   ├── index.mjs         # Servidor e rotas da API
│   ├── siteRepository.mjs # Camada de acesso a dados
│   └── defaultConfig.mjs # Configuração padrão
├── src/                   # Frontend (React)
│   ├── app/              # Componentes do site público
│   ├── admin/            # Painel administrativo
│   ├── curso/            # Página do curso
│   └── specialist/       # Página do especialista
├── .env                  # Variáveis de ambiente (não versionado)
├── .env.example          # Exemplo de configuração
├── package.json          # Dependências e scripts
└── vite.config.ts        # Configuração do Vite
```
