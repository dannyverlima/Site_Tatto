#!/usr/bin/env bash
# ============================================================
#  deploy.sh — Deploy / atualização do site em produção
#  Uso: bash scripts/deploy.sh SEU_DOMINIO.com.br
#  Execute sempre que quiser atualizar o site.
# ============================================================
set -euo pipefail

DOMAIN="${1:-SEU_DOMINIO.com.br}"
APP_DIR="/var/www/studio-markin"

echo "═══════════════════════════════════════════════"
echo "  Studio Markin — Deploy"
echo "  Domínio: $DOMAIN"
echo "═══════════════════════════════════════════════"

cd "$APP_DIR"

# ── 1. Instalar dependências ──────────────────────
echo "[ 1/6 ] Instalando dependências..."
pnpm install --frozen-lockfile

# ── 2. Build do frontend ──────────────────────────
echo "[ 2/6 ] Building frontend..."
node_modules/.bin/vite build --config frontend/vite.config.ts
echo "  ✅ Frontend construído em frontend/dist/"

# ── 3. Executar migrations da base de dados ───────
echo "[ 3/6 ] Executando migrations..."
node --input-type=module <<'MIGRATIONS'
import { pool } from './backend/server/db.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
const migrationsDir = './backend/db/migrations';
const files = (await fs.readdir(migrationsDir)).filter(f => f.endsWith('.sql')).sort();
const client = await pool.connect();
try {
  await client.query('CREATE TABLE IF NOT EXISTS app.migrations (name TEXT PRIMARY KEY, ran_at TIMESTAMPTZ DEFAULT now())');
  for (const file of files) {
    const { rows } = await client.query('SELECT 1 FROM app.migrations WHERE name = $1', [file]);
    if (rows.length > 0) continue;
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await client.query(sql);
    await client.query('INSERT INTO app.migrations (name) VALUES ($1)', [file]);
    console.log('  ✅ Migration:', file);
  }
} finally { client.release(); await pool.end(); }
MIGRATIONS

# ── 4. Configurar Nginx ───────────────────────────
echo "[ 4/6 ] Configurando Nginx..."
NGINX_CONF="/etc/nginx/sites-available/studio-markin"
sed "s/SEU_DOMINIO.com.br/$DOMAIN/g" nginx/studio-markin.conf > "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/studio-markin
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "  ✅ Nginx configurado para $DOMAIN"

# ── 5. SSL com Let's Encrypt ──────────────────────
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "[ 5/6 ] Obtendo certificado SSL gratuito..."
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos \
    --email "studiostattoadmin@gmail.com" --redirect
  echo "  ✅ SSL ativo! Site disponível em https://$DOMAIN"
else
  echo "[ 5/6 ] ✅ Certificado SSL já existe."
fi

# ── 6. Reiniciar backend com PM2 ──────────────────
echo "[ 6/6 ] Iniciando backend com PM2..."
mkdir -p logs
if pm2 describe studio-markin > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save
echo "  ✅ Backend rodando com PM2"

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Deploy concluído!"
echo "  🌐 Site: https://$DOMAIN"
echo "  🔧 Admin: https://$DOMAIN/admin"
echo "  💍 Joalheria Admin: https://$DOMAIN/admin-joalheria"
echo ""
echo "  Comandos úteis:"
echo "  pm2 logs studio-markin   # ver logs em tempo real"
echo "  pm2 status               # ver estado do processo"
echo "  pm2 restart studio-markin # reiniciar o backend"
echo "═══════════════════════════════════════════════"
