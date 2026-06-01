@echo off
REM Script para iniciar Studios Tatto

echo.
echo ===================================
echo  Studios Tatto - Iniciando...
echo ===================================
echo.

REM Matar processos antigos
taskkill /F /IM node.exe 2>nul

timeout /t 2

echo [1/2] Iniciando Backend (API)...
start "" /B cmd /c npm run dev:server

timeout /t 3

echo [2/2] Iniciando Frontend (Site)...
start "" /B cmd /c npm run dev:web

echo.
echo ===================================
echo  ✓ Servidores iniciados!
echo ===================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5175
echo.
echo Pressione Ctrl+C para parar...
echo.

REM Manter a janela aberta
pause
