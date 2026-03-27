@echo off
setlocal EnableExtensions

cd /d "%~dp0frontend"
title Frontend - WhatsApp SaaS Admin

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado no PATH.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Instalando dependencias do frontend...
  call npm.cmd install
  if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias do frontend.
    pause
    exit /b 1
  )
)

if not exist ".env.local" if exist ".env.example" (
  echo [INFO] Criando frontend\.env.local a partir de frontend\.env.example...
  copy /Y ".env.example" ".env.local" >nul
)

if exist ".next" (
  echo [INFO] Limpando cache/build anterior do Next.js...
  rmdir /S /Q ".next"
)

echo [INFO] Iniciando frontend em modo desenvolvimento em http://localhost:3000 ...
call npm.cmd run dev
if errorlevel 1 (
  echo [ERRO] O frontend foi encerrado com falha.
  pause
  exit /b 1
)
