# Deploy na VPS

Este projeto pode ser publicado de dois jeitos:

- `docker-compose.vps.yml`
- `docker-compose.proxy.yml`
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

### EasyPanel ou proxy externo

```powershell
docker compose --env-file .env.production -f docker-compose.vps.yml up -d --build
```

### VPS crua com Caddy do proprio repositorio

```powershell
docker compose --env-file .env.production -f docker-compose.vps.yml -f docker-compose.proxy.yml up -d --build
```

Servicos base esperados:

- `db`
- `redis`
- `api`
- `worker`
- `frontend`

Se usar proxy proprio, tambem:

- `proxy`

## 3. Validar

Checklist:

- painel respondendo no dominio publicado pelo EasyPanel ou Caddy
- health da API em `https://seu-dominio/health`
- webhook da Evolution apontando para `https://seu-dominio/api/v1/webhooks/evolution`

## 4. Atualizar em producao

```powershell
git pull origin main
docker compose --env-file .env.production -f docker-compose.vps.yml up -d --build
```

## Observacoes

- o frontend usa proxy interno para a API via `/backend`
- no EasyPanel, normalmente basta publicar o servico `frontend`
- o Caddy e opcional e cuida do HTTPS automaticamente quando usado
- o backend aplica migrations ao iniciar
- o worker sobe separado para processar mensagens assincronas
