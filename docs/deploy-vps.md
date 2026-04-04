# Deploy na VPS

Este projeto pode ser publicado com um unico dominio usando:

- `docker-compose.vps.yml`
- `.env.production`
- `deploy/production/Caddyfile`

## 1. Preparar ambiente

Copie o exemplo:

```powershell
copy .env.production.example .env.production
```

Preencha no minimo:

- `APP_DOMAIN`
- `LETSENCRYPT_EMAIL`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `OPENAI_API_KEY`

## 2. Subir os containers

```powershell
docker compose --env-file .env.production -f docker-compose.vps.yml up -d --build
```

Servicos esperados:

- `db`
- `redis`
- `api`
- `worker`
- `frontend`
- `proxy`

## 3. Validar

Checklist:

- painel respondendo em `https://seu-dominio`
- health da API em `https://seu-dominio/health`
- webhook da Evolution apontando para `https://seu-dominio/api/v1/webhooks/evolution`

## 4. Atualizar em producao

```powershell
git pull origin main
docker compose --env-file .env.production -f docker-compose.vps.yml up -d --build
```

## Observacoes

- o frontend usa a API no mesmo dominio, via `/api/v1`
- o Caddy cuida do HTTPS automaticamente
- o backend aplica migrations ao iniciar
- o worker sobe separado para processar mensagens assincronas
