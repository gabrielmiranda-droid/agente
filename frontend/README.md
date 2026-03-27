# WhatsApp SaaS Admin

Painel administrativo em Next.js para a plataforma SaaS de atendimento inteligente via WhatsApp.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- componentes no estilo shadcn/ui
- React Hook Form + Zod
- TanStack Query
- camada central de API integrada ao backend FastAPI

## Modulos disponiveis

- autenticacao com JWT
- dashboard executivo
- configuracoes da empresa
- usuarios
- instancias de WhatsApp
- agentes de IA
- base de conhecimento
- inbox de conversas
- metricas
- billing

## Estrutura

```text
frontend/
  src/
    app/
      (auth)/
      (dashboard)/
    components/
    hooks/
    lib/
    types/
```

## Pre-requisitos

- Node.js 20+
- npm 10+
- backend FastAPI rodando

## Configuracao

Copie o arquivo de ambiente:

```powershell
copy .env.example .env.local
```

Variavel principal:

```env
NEXT_PUBLIC_API_BASE_URL=/backend
```

O frontend usa um rewrite do proprio Next.js para encaminhar `/backend/*` para `http://localhost:8000/api/v1/*`. Isso evita problemas de CORS no ambiente local.

## Instalacao

```powershell
npm install
```

## Execucao local recomendada

No Windows, o caminho mais estavel para este projeto e:

```powershell
npm run build
npm run start
```

Ou a partir da raiz do repositorio:

```powershell
INICIAR-FRONTEND.bat
```

Aplicacao:

- `http://localhost:3000`

## Fluxo de autenticacao

- login em `/login`
- tokens salvos em cookies do frontend
- rotas privadas protegidas por middleware
- refresh automatico quando a API retorna `401`

## Integracao com o backend

O frontend espera estes grupos de endpoints:

- `/auth`
- `/companies`
- `/users`
- `/whatsapp-instances`
- `/ai-agents`
- `/knowledge`
- `/conversations`
- `/metrics`
- `/billing`

## Observacoes

- o frontend esta alinhado com a arquitetura multiempresa do backend
- os formularios usam validacao local com Zod
- o carregamento de dados usa cache e invalidacao com TanStack Query
- a tela de conversas foi desenhada para crescer como inbox operacional

## Proximos passos recomendados

- adicionar paginacao e filtros server-side
- mover autenticacao para cookies `httpOnly` com proxy BFF
- adicionar testes E2E com Playwright
- adicionar tabelas avancadas com ordenacao e filtros persistidos
- integrar graficos com uma biblioteca dedicada
