# VIBRA - BFF Gateway

Backend for Frontend (BFF) que realiza agregação de dados, proxy para microserviços e orquestração de functions.

## Tecnologias

- Node.js
- Express
- Axios (HTTP client)
- JWT Authentication
- Helmet (Security)
- Rate Limiting

## Funcionalidades

### 1. Agregação de Dados
Combina dados de múltiplos microserviços em uma única resposta:

- **Dashboard** - Agrega user, events, friends, timeline, notifications
- **Event Details** - Combina evento + organizer + reviews + interests
- **Nearby Events** - User location + filtered events
- **Friend Activities** - Friend profile + timeline
- **Global Search** - Busca em users + events simultaneamente

### 2. Proxy para Microserviços
Roteia requisições para os serviços corretos:

- **Users Service** - Auth, CRUD users, friendships, timeline
- **Events Service** - CRUD events, reviews, interests
- **Functions Service** - HTTP triggers

### 3. Orquestração de Events
Triggera functions para processamento assíncrono:

- **Create Review via Event** - Envia para function processar
- **Notifications** - Triggera notificações automáticas

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar URLs dos microserviços no .env
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
│   Client    │
│ (Frontend)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│       BFF Gateway           │
│                             │
│  • Aggregation              │
│  • Proxy                    │
│  • Orchestration            │
└──────┬──────────────────────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌───────────┐
│  Users   │  │  Events  │  │ Functions │
│ Service  │  │ Service  │  │  Service  │
└──────────┘  └──────────┘  └───────────┘
     │             │              │
     ▼             ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ MongoDB  │  │Azure SQL │  │Azure SQL │
└──────────┘  └──────────┘  └──────────┘
```

## Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/social` - Login social

### Agregação (BFF Específico)
- `GET /api/dashboard` - Dashboard completo
- `GET /api/events/:id/details` - Detalhes completos do evento
- `GET /api/events/nearby` - Eventos próximos do usuário
- `GET /api/friends/:friendId/activities` - Atividades do amigo
- `GET /api/search?q=query` - Busca global

### Proxy - Users
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Proxy - Events
- `GET /api/events` - Listar eventos
- `GET /api/events/:id` - Buscar evento
- `POST /api/events` - Criar evento
- `PUT /api/events/:id` - Atualizar evento
- `DELETE /api/events/:id` - Deletar evento

### Proxy - Reviews
- `GET /api/events/:eventId/reviews` - Listar reviews
- `POST /api/events/:eventId/reviews/event` - **Criar review via EVENT**
- `PUT /api/reviews/:id` - Atualizar review
- `DELETE /api/reviews/:id` - Deletar review

### Proxy - Notifications
- `GET /api/notifications` - Notificações do usuário

## Fluxos Importantes

### 1. Dashboard Aggregation
```
Cliente -> BFF
  BFF -> Users Service (user data)
  BFF -> Events Service (events)
  BFF -> Users Service (friendships)
  BFF -> Users Service (timeline)
  BFF -> Functions Service (notifications)
BFF -> Cliente (dados agregados)
```

### 2. Create Review via Event
```
Cliente -> BFF POST /api/events/1/reviews/event
  BFF -> Functions Service (trigger review-event)
    Function -> Azure SQL (persist review)
  Function -> BFF (confirmation)
BFF -> Cliente (success)
```

### 3. Create Event with Notification
```
Cliente -> BFF POST /api/events
  BFF -> Events Service (create event)
  BFF -> Functions Service (send notification) [async]
BFF -> Cliente (event created)
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| PORT | Porta do BFF | 3000 |
| USERS_SERVICE_URL | URL do Users Service | http://localhost:3001/api |
| EVENTS_SERVICE_URL | URL do Events Service | http://localhost:3002/api |
| FUNCTIONS_SERVICE_URL | URL do Functions Service | http://localhost:3003/api/functions |
| JWT_SECRET | Chave JWT (mesma do Users Service) | secret-key |
| CORS_ORIGIN | Origens permitidas | http://localhost:3000 |
| RATE_LIMIT_WINDOW_MS | Janela de rate limit | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Máximo de requests | 100 |

## Segurança

- **Helmet** - Headers de segurança
- **CORS** - Controle de origem
- **Rate Limiting** - Proteção contra abuso
- **JWT Validation** - Autenticação de usuários

## Docker

```bash
# Build
docker build -t vibra-bff-gateway .

# Run
docker run -p 3000:3000 --env-file .env vibra-bff-gateway
```

## Estrutura do Projeto

```
src/
├── controllers/
│   ├── aggregationController.js  # Agregação de dados
│   └── proxyController.js        # Proxy para serviços
├── middleware/
│   └── auth.js                   # Validação JWT
├── routes/
│   └── index.js                  # Rotas da API
├── services/
│   ├── usersService.js          # Client Users Service
│   ├── eventsService.js         # Client Events Service
│   └── functionsService.js      # Client Functions Service
├── app.js                        # Express app
└── server.js                     # Entry point
```

## Benefícios do BFF

1. **Single Entry Point** - Cliente se comunica apenas com o BFF
2. **Data Aggregation** - Reduz número de requests do cliente
3. **Service Orchestration** - Coordena múltiplos serviços
4. **Optimized for Frontend** - API moldada para as necessidades do frontend
5. **Security Layer** - Centraliza autenticação e autorização
6. **Error Handling** - Tratamento unificado de erros

## Contribuindo

Este projeto faz parte do PJBL da plataforma VIBRA.

## Licença

MIT
