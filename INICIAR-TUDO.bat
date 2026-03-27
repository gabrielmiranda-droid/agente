@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"
title WhatsApp SaaS Platform - Inicializacao

echo.
echo ============================================
echo   WhatsApp SaaS Platform - Iniciar Tudo
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

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado no PATH.
  pause
  exit /b 1
)

where curl >nul 2>nul
if errorlevel 1 (
  echo [ERRO] curl nao encontrado no PATH.
  pause
  exit /b 1
)

if not exist ".env" (
  echo [INFO] Arquivo .env nao encontrado. Criando a partir de .env.example...
  copy /Y ".env.example" ".env" >nul
)

if not exist "frontend\.env.local" (
  echo [INFO] Arquivo frontend\.env.local nao encontrado. Criando a partir de frontend\.env.example...
  copy /Y "frontend\.env.example" "frontend\.env.local" >nul
)

if not exist "frontend\node_modules" (
  echo [INFO] Instalando dependencias do frontend...
  pushd frontend
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo [ERRO] Falha ao instalar dependencias do frontend.
    pause
    exit /b 1
  )
  popd
)

echo [INFO] Verificando se a API ja esta em execucao...
call :is_url_up "http://localhost:8000/health"
if errorlevel 1 (
  echo [INFO] Abrindo backend local em nova janela...
  start "Backend Local - WhatsApp SaaS Platform" "%~dp0INICIAR-BACKEND-LOCAL.bat"
) else (
  echo [INFO] Backend ja estava ativo em http://localhost:8000
)

echo [INFO] Verificando se o frontend ja esta em execucao...
call :is_url_up "http://localhost:3000"
if errorlevel 1 (
  echo [INFO] Abrindo frontend em nova janela...
  start "Frontend - WhatsApp SaaS Admin" "%~dp0INICIAR-FRONTEND.bat"
) else (
  echo [INFO] Frontend ja estava ativo em http://localhost:3000
)

call :wait_for_url "http://localhost:8000/health" "API" 45
if errorlevel 1 (
  echo [AVISO] A API ainda nao respondeu ao healthcheck. Verifique a janela do backend.
) else (
  echo [INFO] API respondendo normalmente.
)

call :wait_for_url "http://localhost:3000/login" "Frontend" 60
if errorlevel 1 (
  echo [AVISO] O frontend ainda nao respondeu totalmente.
  echo Se o frontend estiver compilando no primeiro start, aguarde alguns segundos e recarregue.
) else (
  echo [INFO] Frontend respondendo normalmente.
  echo [INFO] Abrindo painel no navegador...
  start "" "http://localhost:3000/login"
)

echo.
echo [OK] Sistema iniciado.
echo.
echo Backend/API:  http://localhost:8000
echo Docs API:     http://localhost:8000/docs
echo Frontend:     http://localhost:3000
echo.
echo Painel dev:
echo   E-mail: admin@demo.com
echo   Senha:  Confira o valor BOOTSTRAP_DEV_PASSWORD no arquivo .env
echo.
echo Para parar tudo depois, execute: PARAR-TUDO.bat
echo.
pause
exit /b 0

:is_url_up
set "CHECK_URL=%~1"
curl --silent --output NUL --max-time 5 "%CHECK_URL%" >nul 2>nul
if errorlevel 1 (
  exit /b 1
)
exit /b 0

:wait_for_url
set "CHECK_URL=%~1"
set "CHECK_NAME=%~2"
set "CHECK_TIMEOUT=%~3"
set /a WAIT_COUNT=0

echo [INFO] Aguardando %CHECK_NAME% responder em %CHECK_URL% ...

:wait_loop
call :is_url_up "%CHECK_URL%"
if not errorlevel 1 (
  exit /b 0
)

set /a WAIT_COUNT+=1
if !WAIT_COUNT! GEQ %CHECK_TIMEOUT% (
  exit /b 1
)

timeout /t 2 /nobreak >nul
goto :wait_loop
