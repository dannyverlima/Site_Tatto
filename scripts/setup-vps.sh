#!/usr/bin/env bash
# ============================================================
#  setup-vps.sh — Configuração inicial do VPS (Ubuntu 22.04)
#  Execute UMA VEZ como root após criar o VPS.
#  Uso: bash scripts/setup-vps.sh SEU_DOMINIO.com.br
# ============================================================
set -euo pipefail

DOMAIN="${1:-SEU_DOMINIO.com.br}"
APP_DIR="/var/www/studio-markin"
DB_NAME="studio_markin"
DB_USER="studio_user"

echo "═══════════════════════════════════════════════"
echo "  Studio Markin — Setup VPS"
echo "  Domínio: $DOMAIN"
echo "═══════════════════════════════════════════════"

# ── 1. Atualizar sistema ──────────────────────────
echo "[ 1/9 ] Atualizando sistema..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Instalar Node.js 20 LTS ───────────────────
echo "[ 2/9 ] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── 3. Instalar pnpm e PM2 ────────────────────────
echo "[ 3/9 ] Instalando pnpm e PM2..."
npm install -g pnpm pm2
pm2 startup systemd -u root --hp /root

# ── 4. Instalar PostgreSQL ────────────────────────
echo "[ 4/9 ] Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Criar base de dados e utilizador
echo "[ 4/9 ] Configurando banco de dados..."
read -s -p "  → Escolha uma senha para o utilizador '$DB_USER' do banco: " DB_PASS
echo ""
sudo -u postgres psql <<SQL
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
SQL
echo "  ✅ Banco '$DB_NAME' criado com utilizador '$DB_USER'"
echo "  ⚠️  Guarde a senha: $DB_PASS"

# ── 5. Instalar Nginx ─────────────────────────────
echo "[ 5/9 ] Instalando Nginx..."
apt-get install -y nginx
systemctl enable nginx

# ── 6. Instalar Certbot (SSL gratuito) ───────────
echo "[ 6/9 ] Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ── 7. Firewall ───────────────────────────────────
echo "[ 7/9 ] Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "  ✅ Firewall ativo (SSH + HTTP + HTTPS)"

# ── 8. Criar pasta da app e logs ─────────────────
echo "[ 8/9 ] Criando estrutura de pastas..."
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/backend/media"

# ── 9. Instalar ffmpeg (para vídeos no admin) ────
echo "[ 9/9 ] Instalando ffmpeg..."
apt-get install -y ffmpeg

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Setup concluído!"
echo ""
echo "  PRÓXIMOS PASSOS:"
echo "  1. Faça upload do projeto para $APP_DIR"
echo "  2. Copie .env.production.example → backend/.env"
echo "     e preencha os valores reais"
echo "  3. Execute: bash scripts/deploy.sh $DOMAIN"
echo "═══════════════════════════════════════════════"
