# 🎨 Studios Tatto - Guia de Execução

## ✅ Status Atual

O site está **totalmente funcional** e pronto para uso!

### 🚀 Como Iniciar

**Opção 1: Iniciar ambos os servidores (Recomendado)**
```bash
npm run dev
```

**Opção 2: Iniciar servidores individualmente**

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev:web
```

### 📍 URLs

- **Frontend (Site)**: http://localhost:5173
- **Backend (API)**: http://localhost:5175
- **Admin Media**: http://localhost:5175/admin-media

## 📸 Galeria de Imagens

O site inclui **16 imagens de tatuagens** que foram automaticamente copiadas para a galeria em `frontend/public/gallery/`.

As imagens incluem:
- Tatuagens Koi
- Tatuagens de meia-manga (half sleeve)
- Logos
- E mais...

### Adicionar Imagens ao Portfolio

Quando o servidor estiver rodando, execute:
```bash
node scripts/add-images-to-portfolio.mjs
```

Este script:
1. ✅ Copia as imagens de `backend/imagens/videos admin/` para `frontend/public/gallery/`
2. ✅ Adiciona automaticamente as imagens ao portfolio da API
3. ✅ Extrai títulos amigáveis dos nomes dos arquivos

## 🔧 Tecnologias

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, PostgreSQL (com fallback para modo offline)
- **Base de Dados**: Mock em modo desenvolvimento (sem PostgreSQL instalado)

## 📋 O Que Foi Resolvido

✅ Resolvidos conflitos de merge  
✅ Backend configurado para modo offline (sem PostgreSQL)  
✅ Frontend e backend integrados  
✅ Imagens adicionadas à galeria  
✅ Scripts de inicialização criados  
✅ API funcional em http://localhost:5175  

## 🎯 Próximos Passos (Opcional)

Para usar com PostgreSQL em produção:
1. Instale PostgreSQL
2. Crie a base de dados: `studio_tatto`
3. Configure as variáveis de ambiente em `backend/.env`:
   ```
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=sua_senha
   PGDATABASE=studio_tatto
   PORT=5175
   ```
4. Reinicie o servidor

## 📚 Estrutura do Projeto

```
Site_Tatto/
├── frontend/              # Aplicação React
│   ├── public/gallery/    # Imagens da galeria
│   ├── src/
│   └── vite.config.ts
├── backend/              # API Node.js
│   ├── server/           # Servidores
│   ├── imagens/          # Imagens originais
│   └── .env              # Configuração
├── scripts/              # Scripts úteis
│   └── add-images-to-portfolio.mjs
└── package.json          # Dependências
```

## 🆘 Troubleshooting

**Problema**: Porta 5173 ou 5175 já em uso
```bash
# Matar processos em portas específicas
npx kill-port 5173 5175
```

**Problema**: Imagens não aparecem
```bash
# Reexecute o script de imagens
node scripts/add-images-to-portfolio.mjs
```

**Problema**: API retorna erro
- O backend está em modo "offline" (sem PostgreSQL)
- Todas as operações de leitura funcionam normalmente
- Para persistência de dados, configure PostgreSQL

---

**🎉 Tudo pronto! Acesse http://localhost:5173 para ver o site funcionando!**
