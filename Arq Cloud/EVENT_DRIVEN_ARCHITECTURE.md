# Event-Driven Architecture (EDA)

## Visão Geral

O sistema VIBRA implementa **Event-Driven Architecture** usando **RabbitMQ** (local) e **Azure Service Bus** (cloud) como message brokers.

## Conceitos Fundamentais

### O que é EDA?

Event-Driven Architecture é um padrão onde componentes se comunicam através de **eventos** ao invés de chamadas diretas:

**Tradicional (Síncrono)**:
```
Events Service → HTTP POST → Functions Service
     ↓
  BLOCKED aguardando resposta
```

**Event-Driven (Assíncrono)**:
```
Events Service → Publica Evento → Message Broker
                                         ↓
                                  Functions Service consume
```

### Benefícios

- ✅ **Desacoplamento**: Serviços não precisam conhecer uns aos outros
- ✅ **Escalabilidade**: Consumidores podem processar em paralelo
- ✅ **Resiliência**: Se consumidor cair, mensagens ficam na fila
- ✅ **Flexibilidade**: Fácil adicionar novos consumidores sem modificar produtor

---

## Arquitetura

```
┌──────────────────┐
│ Events Service   │  1. Ação ocorre (evento criado)
│ (Publisher)      │
└────────┬─────────┘
         │
         │ 2. Publish event.created
         ▼
┌──────────────────┐
│   RabbitMQ       │  3. Armazena na queue
│  Message Broker  │
│                  │
│  Exchanges:      │
│  - vibra_events  │
│                  │
│  Queues:         │
│  - event.created │
│  - review.created│
│  - interest.marked│
└────────┬─────────┘
         │
         │ 4. Consume message
         ▼
┌──────────────────┐
│ Functions        │  5. Processa evento
│ Service          │     - Envia notificação
│ (Consumer)       │     - Atualiza estatísticas
└──────────────────┘     - Salva no banco
```

---

## Eventos Implementados

### 1. event.created

**Publicado por**: Events Service (quando evento é criado)

**Payload**:
```json
{
  "eventId": "evt_123",
  "eventType": "event.created",
  "timestamp": "2025-01-09T10:30:00Z",
  "data": {
    "eventId": 123,
    "name": "Rock Concert",
    "organizerId": "user_456",
    "category": "Music",
    "location": "São Paulo",
    "startDate": "2025-02-15T20:00:00Z"
  }
}
```

**Consumido por**: Functions Service

**Ações**:
- Envia notificação para seguidores do organizador
- Registra analytics
- Indexa evento para busca

---

### 2. review.created

**Publicado por**: Events Service (quando review é criada)

**Payload**:
```json
{
  "eventId": "evt_789",
  "eventType": "review.created",
  "timestamp": "2025-01-09T10:35:00Z",
  "data": {
    "reviewId": 456,
    "eventId": 123,
    "userId": "user_789",
    "rating": 5
  }
}
```

**Consumido por**: Functions Service

**Ações**:
- Atualiza média de rating do evento
- Envia notificação para organizador
- Atualiza recomendações

---

### 3. interest.marked

**Publicado por**: Events Service (quando usuário marca interesse)

**Payload**:
```json
{
  "eventId": "evt_456",
  "eventType": "interest.marked",
  "timestamp": "2025-01-09T10:40:00Z",
  "data": {
    "eventId": 123,
    "userId": "user_321",
    "status": "going"
  }
}
```

**Consumido por**: Functions Service

**Ações**:
- Atualiza contador de interessados
- Notifica organizador
- Sugere evento para amigos do usuário

---

## Implementação

### Publisher (Events Service)

**Arquivo**: `projeto-microservico-products/src/infrastructure/messaging/EventPublisher.js`

```javascript
const { getPublisher } = require('./infrastructure/messaging/EventPublisher');

// Inicializar
const publisher = getPublisher();
await publisher.connect();

// Publicar evento
await publisher.publishEventCreated({
  id: 123,
  name: 'Rock Concert',
  organizerId: 'user_456',
  category: 'Music',
  location: 'São Paulo',
  startDate: '2025-02-15T20:00:00Z'
});
```

**Como funciona**:
1. Conecta ao RabbitMQ
2. Declara exchange `vibra_events` (tipo: topic)
3. Publica mensagem com routing key (event type)
4. Mensagem fica persistente (durável)

---

### Consumer (Functions Service)

**Arquivo**: `projeto-functions-events/src/infrastructure/messaging/EventConsumer.js`

```javascript
const { getConsumer } = require('./infrastructure/messaging/EventConsumer');
const EventHandlers = require('./handlers/EventHandlers');

// Inicializar
const consumer = getConsumer();
await consumer.connect();

// Subscrever eventos
await consumer.subscribe('event.created', EventHandlers.handleEventCreated);
await consumer.subscribe('review.created', EventHandlers.handleReviewCreated);
await consumer.subscribe('interest.marked', EventHandlers.handleInterestMarked);
```

**Como funciona**:
1. Conecta ao RabbitMQ
2. Cria queue para cada event type
3. Bind queue ao exchange com routing key
4. Consome mensagens e chama handler
5. ACK (acknowledge) após processamento bem-sucedido
6. NACK (rejeita) se falhar → mensagem volta para fila

---

## RabbitMQ Configuration

### Exchange

- **Nome**: `vibra_events`
- **Tipo**: `topic` (permite routing por padrões)
- **Durable**: `true` (persiste após restart)

### Queues

| Queue | Routing Key | Consumer |
|-------|-------------|----------|
| `functions.event.created` | `event.created` | Functions Service |
| `functions.review.created` | `review.created` | Functions Service |
| `functions.interest.marked` | `interest.marked` | Functions Service |

### Message Properties

- **persistent**: `true` (mensagens sobrevivem restart)
- **durable**: `true` (queues persistem)
- **auto_delete**: `false` (queues não são deletadas)

---

## Padrões de Mensageria

### 1. Publish-Subscribe

```
Publisher → Exchange → Queue 1 → Consumer A
                    → Queue 2 → Consumer B
                    → Queue 3 → Consumer C
```

**Uso**: Um evento, múltiplos consumidores

### 2. Work Queue

```
Publisher → Queue → Consumer A
                 → Consumer B  (load balancing)
```

**Uso**: Processar jobs pesados em paralelo

### 3. Routing (Topic)

```
Publisher → Exchange (topic) → Queue (event.created.*) → Consumer A
                             → Queue (event.*.urgent) → Consumer B
```

**Uso**: Filtragem por padrões de routing key

---

## Azure Service Bus (Cloud)

Para produção, usar **Azure Service Bus**:

### Configuração

1. **Criar namespace**:
```bash
az servicebus namespace create \
  --resource-group vibra-rg \
  --name vibra-servicebus \
  --location eastus
```

2. **Obter connection string**:
```bash
az servicebus namespace authorization-rule keys list \
  --resource-group vibra-rg \
  --namespace-name vibra-servicebus \
  --name RootManageSharedAccessKey
```

3. **Configurar em `.env`**:
```bash
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://vibra-servicebus.servicebus.windows.net/;SharedAccessKeyName=...
```

### Código

**Publisher**:
```javascript
const { ServiceBusClient } = require('@azure/service-bus');

const client = new ServiceBusClient(process.env.AZURE_SERVICE_BUS_CONNECTION_STRING);
const sender = client.createSender('event.created');

await sender.sendMessages({
  body: eventData,
  contentType: 'application/json'
});
```

**Consumer**:
```javascript
const receiver = client.createReceiver('event.created');

receiver.subscribe({
  processMessage: async (message) => {
    await handleEvent(message.body);
  },
  processError: async (error) => {
    console.error(error);
  }
});
```

---

## Garantias de Entrega

### At-Least-Once Delivery

RabbitMQ garante que mensagens serão entregues **pelo menos uma vez**.

**Consequência**: Handlers devem ser **idempotentes**!

```javascript
// ❌ NÃO IDEMPOTENTE
async function handleReviewCreated(event) {
  await db.query('UPDATE Events SET reviewCount = reviewCount + 1 WHERE id = ?', [eventId]);
}

// ✅ IDEMPOTENTE
async function handleReviewCreated(event) {
  const processed = await db.query('SELECT * FROM ProcessedEvents WHERE eventId = ?', [event.eventId]);
  if (processed) return; // Já processado

  await db.query('UPDATE Events SET reviewCount = reviewCount + 1 WHERE id = ?', [eventId]);
  await db.query('INSERT INTO ProcessedEvents (eventId) VALUES (?)', [event.eventId]);
}
```

---

## Dead Letter Queue (DLQ)

Se mensagem falhar após N tentativas, vai para DLQ:

```javascript
await channel.assertQueue('event.created', {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': 'dlx',
    'x-message-ttl': 60000, // 1 minuto
    'x-max-retries': 3
  }
});
```

**DLQ**: Armazena mensagens que não puderam ser processadas

---

## Monitoramento

### RabbitMQ Management UI

**URL**: http://localhost:15672
**User**: vibra
**Pass**: vibra123

**Funcionalidades**:
- Ver queues, exchanges, connections
- Monitorar taxa de mensagens
- Ver mensagens na fila
- Publicar mensagens manualmente

### Logs

```bash
# Consumer logs
docker-compose logs -f functions-service

# Publisher logs
docker-compose logs -f events-service

# RabbitMQ logs
docker-compose logs -f rabbitmq
```

---

## Testando Manualmente

### 1. Publicar evento via API

```bash
curl -X POST http://localhost:3002/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Event",
    "description": "Testing EDA",
    "organizerId": "user_123",
    "category": "Technology",
    "location": "São Paulo",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "startDate": "2025-02-15T20:00:00Z"
  }'
```

### 2. Verificar logs do Functions Service

```bash
docker-compose logs -f functions-service
```

Você verá:
```
📥 Event received: event.created
🎉 Processing event.created: { eventId: 123, name: 'Test Event', ... }
📧 Notification created for new event
✅ Event processed: event.created
```

### 3. Ver mensagens no RabbitMQ UI

1. Acesse http://localhost:15672
2. Login: vibra / vibra123
3. Vá em **Queues** → `functions.event.created`
4. Veja mensagens processadas, rate, etc.

---

## Troubleshooting

### Mensagens não sendo consumidas

```bash
# Verificar se consumer está rodando
docker-compose ps functions-service

# Ver logs
docker-compose logs -f functions-service

# Verificar conexão RabbitMQ
docker-compose exec rabbitmq rabbitmqctl list_connections
```

### Mensagens presas na fila

```bash
# Ver queues
docker-compose exec rabbitmq rabbitmqctl list_queues

# Purgar queue (CUIDADO!)
docker-compose exec rabbitmq rabbitmqctl purge_queue functions.event.created
```

### RabbitMQ não conecta

```bash
# Verificar se RabbitMQ está rodando
docker-compose ps rabbitmq

# Restart
docker-compose restart rabbitmq

# Ver logs
docker-compose logs rabbitmq
```

---

## Próximos Passos

- [ ] Implementar Dead Letter Queue
- [ ] Adicionar retry logic com exponential backoff
- [ ] Implementar idempotency check
- [ ] Adicionar monitoring com Prometheus
- [ ] Implementar Event Sourcing
- [ ] Adicionar CQRS pattern
- [ ] Implementar Saga pattern para transações distribuídas

---

**Implementado por**: [ADICIONAR NOMES DOS ALUNOS]
**Data**: Janeiro 2025
**Disciplina**: Arquitetura Cloud
