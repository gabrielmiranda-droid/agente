# Arquitetura SaaS

## Objetivo

Transformar o agente de WhatsApp em uma plataforma multiempresa com backend administrativo, autenticação, isolamento lógico por empresa e base pronta para crescimento.

## Camadas

- `api/`: contratos HTTP e rotas REST.
- `core/`: configuração, segurança, dependências, tratamento de erros.
- `db/`: base SQLAlchemy, sessão e bootstrap.
- `models/`: entidades persistidas.
- `repositories/`: acesso a dados isolado.
- `services/`: regras de negócio e orquestração.
- `integrations/`: clientes externos OpenAI e Evolution.
- `middlewares/`: observabilidade e request logging.
- `workers/`: ganchos para processamento assíncrono futuro.

## Multi-tenant

Todos os recursos de negócio relevantes usam `company_id`, incluindo usuários, instâncias, contatos, conversas, mensagens, agentes, handoffs, conhecimento, métricas e assinatura.

## Fluxo do webhook

1. Webhook recebe payload da Evolution.
2. Parser defensivo extrai `instance_name`, remetente, texto e ID da mensagem.
3. A instância identifica a empresa.
4. O sistema deduplica a mensagem.
5. Cria ou encontra contato e conversa.
6. Se handoff humano estiver ativo, só registra.
7. Caso contrário, busca agente ativo e conhecimento relevante.
8. Chama OpenAI.
9. Envia resposta via Evolution.
10. Registra métricas.

## Próximos degraus de arquitetura

- fila assíncrona para processamento do webhook
- cache para configuração por empresa
- métricas em Prometheus/OpenTelemetry
- storage vetorial para RAG
- frontend admin separado
