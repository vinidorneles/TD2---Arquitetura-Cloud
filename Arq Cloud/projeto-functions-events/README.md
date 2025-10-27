# VIBRA - Functions Service

Serviço de funções serverless para processamento de eventos assíncronos da plataforma VIBRA.

## Tecnologias

- Node.js
- Express (HTTP Triggers)
- Azure SQL Server
- Serverless Architecture

## Funcionalidades

Este serviço implementa 2 functions principais:

### Function 1: Review Event Processor
**Endpoint:** `POST /api/functions/review-event`

Processa a criação de avaliações via eventos assíncronos e persiste no banco de dados.

**Request Body:**
```json
{
  "eventId": 1,
  "userId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Evento incrível!"
}
```

**Casos de uso:**
- BFF envia evento de criação de review
- Function valida e persiste no banco de dados
- Retorna confirmação de processamento

### Function 2: Notification Sender
**Endpoint:** `POST /api/functions/notification`

Envia notificações para usuários sobre eventos, atualizações e interações.

**Request Body:**
```json
{
  "type": "new_event",
  "userId": "507f1f77bcf86cd799439011",
  "eventId": 1,
  "title": "Novo evento próximo!",
  "message": "Festival de Música a 2km de você",
  "data": {
    "eventName": "Festival",
    "distance": 2
  }
}
```

**Tipos de notificação:**
- `new_event` - Novo evento criado
- `event_update` - Evento atualizado
- `new_review` - Nova avaliação
- `friend_going` - Amigo vai comparecer
- `event_reminder` - Lembrete de evento
- `event_cancelled` - Evento cancelado

### Helper Endpoint
**Endpoint:** `GET /api/functions/notifications/:userId`

Retorna todas as notificações de um usuário (para testes).

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar variáveis de ambiente
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Arquitetura

```
┌─────────────┐
│     BFF     │
└──────┬──────┘
       │ HTTP Trigger
       ▼
┌─────────────┐
│  Functions  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Azure SQL  │
└─────────────┘
```

**Fluxo de Processamento:**

1. BFF recebe requisição do cliente
2. BFF envia evento HTTP para a function
3. Function processa assincronamente
4. Function persiste no banco de dados
5. Function retorna confirmação

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| PORT | Porta do servidor | 3003 |
| DB_SERVER | Servidor Azure SQL | xxx.database.windows.net |
| DB_DATABASE | Nome do banco | vibra_events |
| DB_USER | Usuário do banco | admin |
| DB_PASSWORD | Senha do banco | *** |
| CORS_ORIGIN | Origem permitida CORS | * |

## Exemplos de Uso

### Criar Review via Evento

```bash
curl -X POST http://localhost:3003/api/functions/review-event \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "userId": "507f1f77bcf86cd799439011",
    "rating": 5,
    "comment": "Evento incrível!"
  }'
```

### Enviar Notificação

```bash
curl -X POST http://localhost:3003/api/functions/notification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "new_event",
    "userId": "507f1f77bcf86cd799439011",
    "eventId": 1,
    "title": "Novo evento próximo!",
    "message": "Festival de Música a 2km de você"
  }'
```

### Buscar Notificações

```bash
curl http://localhost:3003/api/functions/notifications/507f1f77bcf86cd799439011
```

## Deploy em Azure Functions

Este serviço pode ser facilmente migrado para Azure Functions:

1. Cada função em `src/functions/` pode ser um Azure Function
2. HTTP Triggers já estão implementados
3. Configurar `function.json` para cada função
4. Deploy via Azure CLI ou GitHub Actions

## Estrutura do Projeto

```
src/
├── config/          # Configurações
├── functions/       # Funções serverless
│   ├── createReviewEvent.js
│   └── sendNotification.js
├── app.js          # Express app
└── server.js       # Entry point
```

## Benefícios da Arquitetura Serverless

- **Escalabilidade automática**
- **Pay-per-use** (paga apenas pelo uso)
- **Processamento assíncrono**
- **Desacoplamento** de serviços
- **Alta disponibilidade**

## Contribuindo

Este projeto faz parte do PJBL da plataforma VIBRA.

## Licença

MIT
