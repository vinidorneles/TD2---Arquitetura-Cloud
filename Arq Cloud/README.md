# VIBRA - Event Social Platform

> Sistema de rede social para eventos com arquitetura cloud-native

**Desenvolvido por**: Vinicius Dorneles, lucas Utrabo, Rafael de Freitas, Kael Scott e Matheus Giaretta.

**Disciplina**: Arquitetura Cloud
**Instituição**: Pontifícia Universidade Católica do Paraná (PUCPR)
**Data**: 09/11/2025

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Padrões Arquiteturais](#-padrões-arquiteturais)
- [Componentes do Sistema](#-componentes-do-sistema)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Bancos de Dados](#-bancos-de-dados)
- [Como Executar](#-como-executar)
- [Testes](#-testes)
- [Documentação Adicional](#-documentação-adicional)

---

## 🎯 Visão Geral

O **VIBRA** é uma plataforma de rede social focada em eventos, permitindo que usuários descubram, criem e participem de eventos baseados em localização, interesses e conexões sociais.

### Funcionalidades Principais

- 👤 **Gestão de Usuários**: Cadastro, autenticação (local e social), perfis
- 📅 **Eventos**: Criação, busca geolocalizada, categorização, reviews
- 👥 **Social**: Amizades, timeline, notificações
- ⭐ **Reviews**: Avaliação de eventos com sistema de estrelas
- 🔔 **Notificações**: Sistema de notificações em tempo real
- 🗺️ **Geolocalização**: Busca de eventos por proximidade (Haversine)

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:5173                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BFF/API GATEWAY (Express)                     │
│                     http://localhost:3000                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Aggregation  │  │  Proxy       │  │  Security            │  │
│  │ Layer        │  │  Layer       │  │  (Rate Limit, CORS)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──┬─────────────┬────────────────┬────────────────────────────┬──┘
   │             │                │                            │
   │             │                │                            │
   │             │                │                            │
   ▼             ▼                ▼                            ▼
┌─────────┐  ┌─────────┐  ┌──────────────┐  ┌──────────────────┐
│ Users   │  │ Events  │  │  Functions   │  │    Message       │
│ Service │  │ Service │  │  Service     │  │    Broker        │
│ :3001   │  │ :3002   │  │  :3003       │  │  (RabbitMQ)      │
│         │  │         │  │              │  │  :5672/15672     │
│ Clean   │  │Vertical │  │  Event-      │  │                  │
│ Arch    │  │ Slice   │  │  Driven      │  └──────────────────┘
└────┬────┘  └────┬────┘  └──────┬───────┘
     │            │               │
     │            │               │
     ▼            ▼               ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│MongoDB  │  │SQL      │  │SQL      │
│ Atlas   │  │Server   │  │Server   │
│:27017   │  │Azure    │  │Azure    │
└─────────┘  │:1433    │  │:1433    │
             └─────────┘  └─────────┘
```

### Componentes

| Componente | Porta | Tecnologia | Padrão Arquitetural |
|------------|-------|------------|---------------------|
| **Frontend** | 5173 | React 19 + Vite | Micro-frontend ready |
| **BFF Gateway** | 3000 | Node.js + Express | BFF Pattern |
| **Users Service** | 3001 | Node.js + MongoDB | **Clean Architecture** |
| **Events Service** | 3002 | Node.js + SQL Server | **Vertical Slice** |
| **Functions Service** | 3003 | Node.js + SQL Server | Azure Functions (Simulated) |
| **MongoDB** | 27017 | MongoDB 6.0 | NoSQL Database |
| **SQL Server** | 1433 | MS SQL Server 2022 | Relational Database |
| **RabbitMQ** | 5672/15672 | RabbitMQ 3 | Message Broker |

---

## 💻 Tecnologias Utilizadas

### Frontend
- **React** 19.1.1 - Library UI
- **Vite** 7.1.7 - Build tool
- **React Router** 6.20.1 - Roteamento
- **Axios** - HTTP Client

### Backend (All Services)
- **Node.js** 18+ - Runtime
- **Express** 4.18.2 - Web Framework
- **JWT** - Autenticação
- **Swagger/OpenAPI** 3.0 - Documentação API
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting

### Databases
- **MongoDB Atlas** (Cloud) - Users, Friendships, Timeline
  - Mongoose 8.0.3 - ODM
- **Azure SQL Server** (Cloud) - Events, Reviews, Interests
  - mssql 10.0.1 - Driver
- **SQLite** (Fallback) - Desenvolvimento local

### Message Broker
- **RabbitMQ** 3.x - Pub/Sub messaging
- **Azure Service Bus** (Cloud) - Enterprise messaging

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **Jest** 29.7.0 - Framework de testes
- **Nodemon** - Auto-reload em desenvolvimento

---

## 🎨 Padrões Arquiteturais

### 1. Clean Architecture (Users Microservice)

O serviço de usuários implementa **Clean Architecture** (Uncle Bob), com separação em 4 camadas:

```
src/
├── domain/                    # CAMADA DE DOMÍNIO
│   ├── entities/              # Entidades (User)
│   ├── value-objects/         # Value Objects (Email, Password)
│   └── repositories/          # Interfaces (Ports)
│
├── application/               # CAMADA DE APLICAÇÃO
│   ├── use-cases/             # Casos de Uso
│   │   ├── auth/              # RegisterUserUseCase, LoginUserUseCase
│   │   └── user/              # GetUserByIdUseCase, UpdateUserUseCase
│   └── services/              # Service Interfaces
│
├── infrastructure/            # CAMADA DE INFRAESTRUTURA
│   ├── database/mongodb/      # MongoDB implementation
│   ├── services/              # BcryptPasswordService, JwtTokenService
│   └── di/                    # Dependency Injection Container
│
└── presentation/              # CAMADA DE APRESENTAÇÃO
    ├── controllers/           # Controllers HTTP
    └── routes/                # Express Routes
```

**Benefícios**:
- ✅ Independência de frameworks
- ✅ Testabilidade (domain não depende de nada)
- ✅ Fácil troca de tecnologias (trocar MongoDB por PostgreSQL afeta apenas infrastructure)
- ✅ Inversão de dependência (DI)

📖 **Documentação Completa**: [projeto-microservico-users/CLEAN_ARCHITECTURE.md](projeto-microservico-users/CLEAN_ARCHITECTURE.md)

---

### 2. Vertical Slice Architecture (Events Microservice)

O serviço de eventos usa **Vertical Slice Architecture**, organizando código por **features**:

```
src/
└── features/
    ├── events/
    │   ├── CreateEvent/
    │   │   ├── CreateEvent.handler.js    # Lógica completa
    │   │   ├── CreateEvent.endpoint.js   # Adaptador HTTP
    │   │   └── index.js
    │   ├── GetEvents/
    │   │   ├── GetEvents.handler.js
    │   │   ├── GetEvents.endpoint.js
    │   │   └── index.js
    │   └── GetEventById/
    │       └── ...
    └── routes.js              # Mapeia features para rotas
```

**Benefícios**:
- ✅ Features auto-contidas (tudo em uma pasta)
- ✅ Mudanças localizadas
- ✅ Fácil adicionar/remover features
- ✅ Baixo acoplamento entre features

📖 **Documentação Completa**: [projeto-microservico-products/VERTICAL_SLICE.md](projeto-microservico-products/VERTICAL_SLICE.md)

---

### 3. BFF (Backend for Frontend) Pattern

O **BFF Gateway** serve como camada de agregação entre frontend e microservices:

**Responsabilidades**:
- ✅ **Agregação**: Combina dados de múltiplos serviços (dashboard, event details)
- ✅ **Proxy**: Encaminha requests para serviços específicos
- ✅ **Segurança**: Rate limiting, CORS, JWT validation
- ✅ **Transformação**: Adapta dados para necessidades do frontend

**Exemplo de Agregação**:
```javascript
// GET /api/dashboard
{
  user: {...},           // de Users Service
  events: [...],         // de Events Service
  friends: [...],        // de Users Service
  timeline: [...],       // de Users Service
  notifications: [...]   // de Functions Service
}
```

---

### 4. Microservices Architecture

Cada serviço é:
- ✅ **Independente**: Deploy, escala e falha independentemente
- ✅ **Bounded Context**: Domínio bem definido (Users, Events, Functions)
- ✅ **Database per Service**: Cada serviço tem seu próprio DB
- ✅ **Communication**: HTTP/REST + Message Queue
- ✅ **Stateless**: Facilita escalabilidade horizontal

---

## 🎯 Componentes do Sistema

### 1. Frontend (React Micro-frontend)

**Localização**: `projeto-microfrontend/`

**Páginas**:
- `/login` - Autenticação
- `/dashboard` - Visão geral (eventos, amigos, timeline)
- `/events` - Lista de eventos
- `/events/:id` - Detalhes do evento

**Features**:
- Autenticação JWT com localStorage
- Protected routes
- Service layer para comunicação com BFF
- Responsive design

**Como rodar**:
```bash
cd projeto-microfrontend
npm install
npm run dev  # http://localhost:5173
```

---

### 2. BFF Gateway

**Localização**: `projeto-bff-gateway/`

**Endpoints de Agregação**:
- `GET /api/dashboard` - Dashboard completo
- `GET /api/events/:id/details` - Evento + reviews + organizer
- `GET /api/events/nearby` - Eventos próximos (geolocalização)
- `GET /api/search` - Busca global

**Endpoints Proxy**:
- `/api/auth/*` → Users Service
- `/api/users/*` → Users Service
- `/api/events/*` → Events Service
- `/api/functions/*` → Functions Service

**Segurança**:
- Helmet.js (security headers)
- Rate limiting (100 req/15min)
- CORS configurado
- JWT middleware

**Como rodar**:
```bash
cd projeto-bff-gateway
npm install
npm run dev  # http://localhost:3000
```

**Swagger**: http://localhost:3000/api-docs

---

### 3. Users Microservice (Clean Architecture)

**Localização**: `projeto-microservico-users/`

**Banco de Dados**: MongoDB Atlas (vibra_users)

**Entidades**:
- **User**: id, name, email, password, authProvider, profilePicture, location
- **Friendship**: userId, friendId, status (pending/accepted/rejected)
- **Timeline**: userId, content, type (post/event/review)

**Use Cases**:
- `RegisterUserUseCase` - Cadastro de usuário
- `LoginUserUseCase` - Autenticação
- `GetUserByIdUseCase` - Buscar usuário
- `GetUsersUseCase` - Listar usuários (paginado)
- `UpdateUserUseCase` - Atualizar perfil

**Endpoints Principais**:
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário
- `PUT /api/users/:id` - Atualizar perfil
- `POST /api/friendships` - Enviar pedido de amizade
- `GET /api/timeline/:userId` - Timeline do usuário

**Como rodar**:
```bash
cd projeto-microservico-users
npm install
npm run dev  # http://localhost:3001
```

**Swagger**: http://localhost:3001/api-docs

---

### 4. Events Microservice (Vertical Slice)

**Localização**: `projeto-microservico-products/`

**Banco de Dados**: Azure SQL Server (vibra_events)

**Tabelas**:
- **Events**: id, name, description, organizerId, category, location, lat, lng, startDate, endDate
- **Reviews**: id, eventId, userId, rating (1-5), comment
- **EventInterest**: id, eventId, userId, status (interested/going)

**Features Implementadas**:
- `CreateEvent` - Criar evento
- `GetEvents` - Listar eventos (filtros, geolocalização, paginação)
- `GetEventById` - Detalhes do evento
- `CreateReview` - Avaliar evento
- `GetReviews` - Reviews do evento
- `MarkInterest` - Marcar interesse

**Busca Geolocalizada**:
Usa **fórmula de Haversine** para calcular distância:
```sql
6371 * ACOS(
  COS(RADIANS(@latitude)) * COS(RADIANS(latitude)) *
  COS(RADIANS(longitude) - RADIANS(@longitude)) +
  SIN(RADIANS(@latitude)) * SIN(RADIANS(latitude))
) <= @radius
```

**Endpoints Principais**:
- `POST /api/events` - Criar evento
- `GET /api/events` - Listar eventos (+ filtros)
- `GET /api/events/:id` - Buscar evento
- `POST /api/events/:id/reviews` - Criar review
- `POST /api/events/:id/interest` - Marcar interesse

**Como rodar**:
```bash
cd projeto-microservico-products
npm install
npm run dev  # http://localhost:3002
```

**Swagger**: http://localhost:3002/api-docs

---

### 5. Functions Service (Event-Driven)

**Localização**: `projeto-functions-events/`

**Banco de Dados**: Azure SQL Server (vibra_events)

**Functions Implementadas**:
- `createReviewEvent` - Processa eventos de review
- `sendNotification` - Envia notificações

**Endpoints**:
- `POST /api/functions/review-event` - Criar review via evento
- `POST /api/functions/notification` - Enviar notificação
- `GET /api/functions/notifications/:userId` - Buscar notificações

**Nota**: Atualmente funciona como serviço HTTP. Para Azure Functions verdadeiras, veja configuração abaixo.

**Como rodar**:
```bash
cd projeto-functions-events
npm install
npm run dev  # http://localhost:3003
```

---

## 📨 Event-Driven Architecture

### Fluxo de Eventos

```
┌──────────────┐
│ Events       │
│ Service      │  1. Evento criado
└──────┬───────┘
       │
       │ 2. Publica mensagem
       ▼
┌──────────────┐
│  RabbitMQ    │  3. Queue: event.created
│  Message     │
│  Broker      │
└──────┬───────┘
       │
       │ 4. Consume evento
       ▼
┌──────────────┐
│ Functions    │  5. Processa
│ Service      │     - Envia notificações
│              │     - Atualiza estatísticas
└──────────────┘
```

### Message Queues Configuradas

1. **event.created** - Novo evento criado
2. **review.created** - Nova review criada
3. **notification.send** - Enviar notificação

### Integração com Azure Service Bus

Para usar **Azure Service Bus** (cloud):

1. Criar namespace no Azure Portal
2. Obter connection string
3. Configurar em `.env`:
```bash
AZURE_SERVICE_BUS_CONNECTION_STRING=Endpoint=sb://...
```

4. Atualizar código para usar `@azure/service-bus`

---

## 🗄️ Bancos de Dados

### MongoDB Atlas (Users Service)

**Connection String**:
```
mongodb+srv://Vibra:Vibra123@cluster0.yscdoft.mongodb.net/vibra_users
```

**Database**: `vibra_users`

**Collections**:
- `users` - Usuários
- `friendships` - Amizades
- `timelines` - Timeline/feed

**Configuração**:
```javascript
// projeto-microservico-users/src/config/database.js
mongoose.connect(process.env.MONGODB_URI);
```

---

### Azure SQL Server (Events & Functions)

**Server**: `vibra-sql-server.database.windows.net`
**Database**: `vibra_events`
**User**: `vibra`

**Tabelas**:
- `Events` - Eventos
- `Reviews` - Avaliações
- `EventInterest` - Interesses

**Inicialização**:
```bash
# Executar script SQL
cd projeto-microservico-products/src/config
sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -i initDatabase.sql
```

**Fallback SQLite**:
Para desenvolvimento local sem Azure, usa SQLite:
```javascript
// Automaticamente ativa se Azure SQL falhar
const db = new SQLite('./vibra_events.db');
```

---

## 🚀 Como Executar

### Opção 1: Docker Compose (Recomendado)

**Inicia TUDO automaticamente** (Frontend, BFF, Microservices, Bancos, RabbitMQ):

```bash
cd "Arq Cloud"

# Usar o script facilitador
./start-all.sh

# OU manualmente:
docker-compose up -d
```

**Serviços disponíveis**:
- Frontend: http://localhost:5173
- BFF Gateway: http://localhost:3000
- Users Service: http://localhost:3001
- Events Service: http://localhost:3002
- Functions Service: http://localhost:3003
- RabbitMQ Management: http://localhost:15672 (vibra/vibra123)

**Ver logs**:
```bash
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs -f bff-gateway
```

**Parar tudo**:
```bash
docker-compose down
docker-compose down -v  # Remove volumes (apaga DBs)
```

---

### Opção 2: Executar Localmente (Desenvolvimento)

#### Pré-requisitos:
- Node.js 18+
- MongoDB (local ou Atlas)
- SQL Server (local ou Azure)
- RabbitMQ (local)

#### 1. Instalar dependências

```bash
# Frontend
cd projeto-microfrontend && npm install

# BFF
cd ../projeto-bff-gateway && npm install

# Users Service
cd ../projeto-microservico-users && npm install

# Events Service
cd ../projeto-microservico-products && npm install

# Functions Service
cd ../projeto-functions-events && npm install
```

#### 2. Configurar variáveis de ambiente

Copiar `.env.example` para `.env` em cada serviço:

```bash
cp .env.example projeto-microservico-users/.env
cp .env.example projeto-microservico-products/.env
cp .env.example projeto-functions-events/.env
cp .env.example projeto-bff-gateway/.env
```

Editar `.env` com suas credenciais.

#### 3. Iniciar bancos de dados

```bash
# MongoDB (Docker)
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:6.0

# SQL Server (Docker)
docker run -d -p 1433:1433 \
  -e ACCEPT_EULA=Y \
  -e SA_PASSWORD='YourStrong@Passw0rd' \
  mcr.microsoft.com/mssql/server:2022-latest

# RabbitMQ (Docker)
docker run -d -p 5672:5672 -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=vibra \
  -e RABBITMQ_DEFAULT_PASS=vibra123 \
  rabbitmq:3-management
```

#### 4. Inicializar SQL Server

```bash
cd projeto-microservico-products/src/config
sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -i initDatabase.sql
```

#### 5. Iniciar serviços

Em terminais separados:

```bash
# Terminal 1 - Users Service
cd projeto-microservico-users
npm run dev

# Terminal 2 - Events Service
cd projeto-microservico-products
npm run dev

# Terminal 3 - Functions Service
cd projeto-functions-events
npm run dev

# Terminal 4 - BFF Gateway
cd projeto-bff-gateway
npm run dev

# Terminal 5 - Frontend
cd projeto-microfrontend
npm run dev
```

---

## 🧪 Testes

### Testes de Arquitetura

Valida que o código segue as regras arquiteturais:

```bash
# Clean Architecture (Users)
cd projeto-microservico-users
npm test tests/architecture/CleanArchitecture.test.js

# Vertical Slice (Events)
cd projeto-microservico-products
npm test tests/architecture/VerticalSlice.test.js
```

**O que é testado**:
- ✅ Regra de dependência (Domain não depende de nada)
- ✅ Inversão de dependência (Use cases recebem DI)
- ✅ Features independentes (Vertical Slice)
- ✅ Convenções de nomenclatura
- ✅ Pureza de entidades

📖 **Documentação**: [ARCHITECTURE_TESTS.md](ARCHITECTURE_TESTS.md)

---

### Testes Unitários (TODO)

```bash
npm test
npm test -- --coverage
npm test -- --watch
```

---

### Testes de Integração (TODO)

```bash
npm run test:integration
```

---

### Testes E2E (TODO)

```bash
npm run test:e2e
```

---

## 📚 Documentação Adicional

### Por Componente

- [Clean Architecture - Users](projeto-microservico-users/CLEAN_ARCHITECTURE.md)
- [Vertical Slice - Events](projeto-microservico-products/VERTICAL_SLICE.md)
- [Architecture Tests](ARCHITECTURE_TESTS.md)

### Swagger/OpenAPI

Cada serviço expõe documentação interativa:

- **Users**: http://localhost:3001/api-docs
- **Events**: http://localhost:3002/api-docs
- **Functions**: http://localhost:3003/api-docs
- **BFF**: http://localhost:3000/api-docs

### Diagramas

```bash
# Gerar diagramas de dependência
npm run docs:diagrams
```

---

## 🔐 Segurança

### Autenticação

- JWT com expiração de 7 dias
- Password hashing com bcrypt (salt rounds: 10)
- Social auth (Google, Facebook)

### Proteções

- ✅ Helmet.js (security headers)
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configurado
- ✅ Input validation (express-validator)
- ✅ SQL injection protection (parameterized queries)

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---


