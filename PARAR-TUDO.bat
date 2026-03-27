@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title WhatsApp SaaS Platform - Parar Tudo

echo.
echo ============================================
echo   WhatsApp SaaS Platform - Parar Tudo
echo ============================================
echo.

docker compose down
if errorlevel 1 (
  echo [ERRO] Falha ao parar os containers.
  pause
  exit /b 1
)

for %%W in (
  "Backend Local - WhatsApp SaaS Platform"
  "Worker Local - WhatsApp SaaS Platform"
  "Frontend - WhatsApp SaaS Admin"
) do (
  taskkill /FI "WINDOWTITLE eq %%~W" /T /F >nul 2>nul
)

for %%P in (8000 3000) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P" ^| findstr "LISTENING"') do (
    taskkill /PID %%I /F >nul 2>nul
  )
)

echo [OK] Containers e processos locais finalizados.
echo.
pause
