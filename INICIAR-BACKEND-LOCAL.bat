@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title WhatsApp SaaS Platform - Backend Local

set "PYTHON_CMD="
set "ACTIVATE_BAT="

if exist ".venv313\Scripts\python.exe" (
  set "PYTHON_CMD="%~dp0.venv313\Scripts\python.exe""
  set "ACTIVATE_BAT=%~dp0.venv313\Scripts\activate.bat"
)

if not defined PYTHON_CMD if exist ".venv\Scripts\python.exe" (
  set "PYTHON_CMD="%~dp0.venv\Scripts\python.exe""
  set "ACTIVATE_BAT=%~dp0.venv\Scripts\activate.bat"
)

if not defined PYTHON_CMD (
  where py >nul 2>nul
  if not errorlevel 1 (
    set "PYTHON_CMD=py -3.14"
  ) else (
    set "PYTHON_CMD=python"
  )
)

echo.
echo ============================================
echo   WhatsApp SaaS Platform - Backend Local
echo ============================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Docker nao encontrado no PATH.
  pause
  exit /b 1
)

docker info >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Docker Desktop/daemon nao esta em execucao.
  echo Abra o Docker Desktop e tente novamente.
  pause
  exit /b 1
)

if not exist ".env" (
  echo [INFO] Arquivo .env nao encontrado. Criando a partir de .env.example...
  copy /Y ".env.example" ".env" >nul
)

echo [INFO] Subindo PostgreSQL e Redis no Docker...
docker compose up -d db redis
if errorlevel 1 (
  echo [ERRO] Falha ao subir db/redis.
  pause
  exit /b 1
)

echo [INFO] Aplicando migrations...
call %PYTHON_CMD% -m alembic upgrade head
if errorlevel 1 (
  echo [ERRO] Falha ao aplicar migrations.
  pause
  exit /b 1
)

echo [INFO] Abrindo worker local em nova janela...
if defined ACTIVATE_BAT (
  start "Worker Local - WhatsApp SaaS Platform" cmd /k cd /d "%~dp0" ^& call "%ACTIVATE_BAT%" ^& powershell -ExecutionPolicy Bypass -File scripts\start-worker.ps1
) else (
  start "Worker Local - WhatsApp SaaS Platform" cmd /k cd /d "%~dp0" ^& powershell -ExecutionPolicy Bypass -File scripts\start-worker.ps1
)

echo [INFO] Iniciando API local...
call %PYTHON_CMD% -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
