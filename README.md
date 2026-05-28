# Studios Tatto - Site

Site profissional para estúdio de tatuagem com painel administrativo, portfólio, especialistas, curso e formulários de contacto.

Design original: https://www.figma.com/design/VoUMBtwXVHMNnO494d6IFq/Tattoo-Studio-Website-Design

## Para rodar localmente

1. Instale dependências:

```bash
pnpm install
```

2. Inicie frontend + API em um comando (acesso via 5173):

```bash
pnpm dev
```

Abra: http://localhost:5173

Se preferir terminais separados:

Terminal 1: `pnpm dev:web`
Terminal 2: `pnpm dev:server`

Admin uploads require the API server to be running.

## Requisitos

- Node.js 18+ (recomendado 22+)
- PostgreSQL 14+

## Estrutura do Projeto

```
Site_Tatto/
├── backend/               # API + base de dados (server, db, midias admin)
├── frontend/              # React + Vite (src, public, html, config)
├── scripts/               # Scripts locais de dev
├── package.json           # Dependências e scripts
└── README.md              # Instruções
```
