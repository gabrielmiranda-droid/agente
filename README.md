# WhatsApp SaaS Platform

Plataforma SaaS multiempresa para atendimento via WhatsApp com foco em lanchonetes, hamburguerias, marmitarias, delivery de bebidas e retirada no local.

Fluxo principal:

`WhatsApp -> Evolution API -> webhook FastAPI -> fila Celery/Redis -> OpenAI -> resposta via Evolution -> painel`

## O que este projeto entrega

- backend FastAPI com isolamento por `company_id`
- worker Celery para processamento assincrono
- integracao com Evolution API por instancia
- contexto automatico para IA com negocio, cardapio, horarios e promocoes
- painel com dois perfis apenas:
  - `dev`
  - `attendant`

## Estado atual validado

- backend com testes automatizados passando
- frontend com build de producao concluido
- webhook da Evolution com parser mais robusto
- suporte a `company_id` no modo dev para operar empresa em foco
- compatibilidade ajustada para Python `3.12` a `3.14`

## Stack

- Python 3.12 a 3.14
- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- Celery
- Next.js
- Evolution API
- OpenAI API

## Estrutura de producao recomendada

O repositorio agora inclui duas formas de subir em producao:

- `docker-compose.vps.yml`
- `docker-compose.proxy.yml`
- `.env.production.example`
- `deploy/production/Caddyfile`

Arquitetura mais indicada no EasyPanel:

`Internet/EasyPanel -> frontend Next.js -> rewrite /backend -> FastAPI -> Redis/Postgres -> worker Celery`

Arquitetura opcional para VPS crua com proxy proprio:

`Internet -> Caddy -> frontend Next.js + rotas /api -> FastAPI -> Redis/Postgres -> worker Celery`

### Como subir online

1. Copie o exemplo de ambiente:

```powershell
copy .env.production.example .env.production
```

2. Preencha pelo menos:

- `APP_DOMAIN`
- `LETSENCRYPT_EMAIL`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `OPENAI_API_KEY`

3. Suba em producao no EasyPanel/VPS com proxy externo:

```powershell
docker compose --env-file .env.production -f docker-compose.vps.yml up -d --build
```

Se quiser usar o proxy Caddy do proprio repositorio em uma VPS crua:

```powershell
docker compose --env-file .env.production -f docker-compose.vps.yml -f docker-compose.proxy.yml up -d --build
```

4. URLs importantes depois do deploy:

- painel: `https://seu-dominio`
- health da API: `https://seu-dominio/health`
- webhook Evolution: `https://seu-dominio/api/v1/webhooks/evolution`

### Observacoes de deploy

- o frontend em producao usa `NEXT_PUBLIC_API_BASE_URL=/backend`
- no EasyPanel, publique o servico `frontend`
- o frontend faz proxy interno para `api:8000/api/v1`
- se usar `docker-compose.proxy.yml`, o Caddy publica HTTPS automatico com Let's Encrypt
- no modo com Caddy, as rotas `/api/*`, `/health`, `/docs`, `/redoc` e `/openapi.json` sao enviadas para a API
- o worker sobe separado no mesmo compose
- o `scripts/start.sh` roda `alembic upgrade head` antes da API iniciar

## Perfis

### `dev`

Pode:

- gerenciar empresas
- conectar instancias do WhatsApp
- configurar agentes
- ver metricas e suporte
- operar uma empresa especifica via `companyId`

### `client`

Pode:

- operar apenas a propria empresa
- acompanhar conversas
- responder manualmente
- atualizar negocio, cardapio, horarios, promocoes e FAQ

Nao pode:

- acessar empresas de terceiros
- acessar rotas criticas de administracao global

## Contexto da IA

O atendimento nao depende de um prompt gigante escrito manualmente pelo cliente.

A IA usa automaticamente:

- dados do negocio
- categorias e produtos
- adicionais
- horarios
- promocoes
- mensagem de boas-vindas
- mensagem fora do horario
- FAQ/base de conhecimento
- historico recente da conversa

Tambem foram adicionadas regras para:

- responder em portugues do Brasil
- ser objetiva
- evitar inventar preco, horario, promocao ou politica da loja
- se comportar como atendimento de delivery e retirada

## Webhook da Evolution

Endpoint:

`POST /api/v1/webhooks/evolution`

O parser atual extrai corretamente, quando disponiveis:

- `instance_name`
- `remoteJid`
- numero do cliente
- `pushName`
- texto da mensagem
- legenda de imagem/video/documento
- respostas de botoes/listas
- `provider_message_id`

Mensagens sao ignoradas quando:

- vieram do proprio bot
- sao de grupo
- sao eventos de status/broadcast
- o evento nao e suportado
- nao ha texto util
- a instancia nao bate com uma empresa ativa
- o webhook secret esta invalido

## Multiempresa

O backend usa `resolve_company_id` nas rotas com escopo operacional.

No frontend, o modo dev agora repassa `companyId` para:

- dashboard
- conversas
- pedidos
- relatorios
- usuarios
- knowledge/FAQ
- metricas
- instancias WhatsApp
- agentes

## Rodando localmente

### 1. Backend

Crie a venv:

```powershell
py -3.14 -m venv .venv313
.\.venv313\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Suba infraestrutura:

```powershell
docker compose up -d db redis
```

Suba a API:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Suba o worker em outro terminal:

```powershell
.\.venv313\Scripts\Activate.ps1
powershell -ExecutionPolicy Bypass -File scripts\start-worker.ps1
```

Docs:

`http://localhost:8000/docs`

### 2. Frontend

```powershell
cd frontend
cmd /c npm install
cmd /c npm run dev
```

Frontend:

`http://localhost:3000`

## Configuracao local com ngrok + Evolution na VPS

Esse e o fluxo recomendado para seu cenario atual:

- frontend local
- backend local
- Evolution API na VPS/EasyPanel
- instancia do WhatsApp conectada na Evolution
- ngrok expondo o backend local

### 1. Suba o ngrok

```powershell
ngrok http 8000
```

Exemplo de URL publica:

`https://abc123.ngrok-free.app`

### 2. Configure o webhook na Evolution

Webhook:

`https://abc123.ngrok-free.app/api/v1/webhooks/evolution`

Se usar segredo, envie:

`X-Webhook-Secret: seu-segredo`

### 3. Cadastre a instancia no sistema

No painel ou via API, a instancia deve usar:

- `instance_name`: exatamente igual ao nome da instancia na Evolution
- `api_base_url`: URL da Evolution na VPS
- `api_key`: chave da Evolution
- `webhook_secret`: opcional, mas recomendado

Exemplo:

```json
{
  "name": "Principal",
  "instance_name": "tenant-main",
  "api_base_url": "https://evolution.seudominio.com",
  "api_key": "SUA_API_KEY",
  "phone_number": "5511999999999",
  "webhook_secret": "hook-secret",
  "active": true
}
```

## Fluxo completo de teste real

### Checklist

- backend rodando em `localhost:8000`
- worker rodando
- Redis rodando
- frontend rodando em `localhost:3000`
- ngrok ativo apontando para `8000`
- Evolution na VPS com webhook apontando para o ngrok
- instancia cadastrada no sistema com `api_base_url`, `api_key` e `instance_name`
- `OPENAI_API_KEY` configurada

### Passo a passo

1. Envie uma mensagem para o numero conectado na Evolution.
2. A Evolution chama o webhook local via ngrok.
3. O backend:
   - valida o payload
   - identifica a instancia e a empresa
   - evita duplicidade
   - cria/atualiza contato
   - cria conversa
   - salva mensagem de entrada
   - enfileira a task
4. O worker:
   - monta contexto
   - respeita horario de atendimento
   - consulta OpenAI
   - salva mensagem de saida
   - envia resposta pela Evolution
5. O painel exibe a conversa.

### Resposta esperada do webhook

```json
{
  "status": "accepted",
  "detail": "Mensagem recebida e enfileirada",
  "company_id": 1,
  "conversation_id": 10,
  "provider_message_id": "MSG-123",
  "task_id": "celery-task-id"
}
```

## Observabilidade

Logs estruturados cobrem:

- startup da aplicacao
- recebimento do webhook
- parse do payload
- enfileiramento
- inicio do worker
- montagem de contexto
- falha na OpenAI
- envio via Evolution
- conclusao da task

## Testes

Backend:

```powershell
.\.venv313\Scripts\python.exe -m pytest
```

Frontend:

```powershell
cd frontend
cmd /c npm run build
```

## Endpoints principais

### Auth

- `POST /api/v1/auth/register-company`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`

### Empresas

- `GET /api/v1/companies`
- `POST /api/v1/companies`
- `GET /api/v1/companies/me`
- `GET /api/v1/companies/{company_id}`
- `PATCH /api/v1/companies/me`
- `PATCH /api/v1/companies/{company_id}`

### Operacao

- `GET /api/v1/conversations`
- `GET /api/v1/conversations/{id}/messages`
- `PATCH /api/v1/conversations/{id}`
- `POST /api/v1/conversations/{id}/handoff`
- `POST /api/v1/conversations/{id}/handoff/close`
- `POST /api/v1/conversations/{id}/pause-bot`
- `POST /api/v1/conversations/{id}/resume-bot`
- `POST /api/v1/conversations/{id}/messages`

### Cadastro da loja

- `GET/PATCH /api/v1/business-profile`
- `GET/POST/PATCH /api/v1/catalog/categories`
- `GET/POST/PATCH /api/v1/catalog/products`
- `GET/POST/PATCH /api/v1/catalog/addons`
- `GET/POST/PATCH /api/v1/business-hours`
- `GET/POST/PATCH /api/v1/promotions`
- `GET/POST /api/v1/knowledge`

### Plataforma

- `GET/POST /api/v1/whatsapp-instances`
- `GET/POST /api/v1/ai-agents`
- `GET /api/v1/metrics`

## Proximos passos recomendados

- adicionar um endpoint de health-check da Evolution por instancia
- criar modulo formal de pedidos com itens, status e valor
- adicionar filtros por empresa e periodo nas metricas
- implementar auditoria de eventos e tela real de logs
- subir backend, worker, frontend e ngrok substituido por dominio publico na VPS
