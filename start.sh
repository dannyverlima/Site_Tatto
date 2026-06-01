#!/bin/bash
# Script para iniciar o site

echo "🚀 Iniciando Studios Tatto..."
echo ""

# Matar processos antigos
echo "Parando servidores antigos..."
npx kill-port 5175 2>/dev/null || true
npx kill-port 5173 2>/dev/null || true
sleep 1

echo ""
echo "📦 Iniciando backend..."
npm run dev:server &
BACKEND_PID=$!

sleep 3

echo ""
echo "🎨 Iniciando frontend..."
npm run dev:web &
FRONTEND_PID=$!

echo ""
echo "✅ Servidores iniciados!"
echo "   Backend: http://localhost:5175"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para parar..."
echo ""

wait
