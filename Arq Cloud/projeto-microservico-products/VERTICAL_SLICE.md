# Vertical Slice Architecture - Events Microservice

## Visão Geral

Este microserviço implementa **Vertical Slice Architecture**, um padrão alternativo à tradicional arquitetura em camadas horizontais.

## O que é Vertical Slice Architecture?

Ao invés de organizar código por **camadas técnicas** (Controllers, Services, Repositories), organizamos por **features/funcionalidades**.

### Arquitetura Tradicional (Horizontal Layers):
```
controllers/
  ├── eventController.js    ← Todos os controllers aqui
  ├── reviewController.js
  └── interestController.js
services/
  ├── eventService.js       ← Todos os services aqui
  ├── reviewService.js
  └── interestService.js
repositories/
  ├── eventRepository.js    ← Todos os repositories aqui
  ├── reviewRepository.js
  └── interestRepository.js
```

**Problema**: Para adicionar/modificar uma feature, você precisa mexer em 3+ arquivos espalhados!

### Vertical Slice Architecture:
```
features/
  ├── events/
  │   ├── CreateEvent/
  │   │   ├── CreateEvent.handler.js    ← TUDO para criar evento aqui
  │   │   ├── CreateEvent.endpoint.js
  │   │   └── index.js
  │   ├── GetEvents/
  │   │   ├── GetEvents.handler.js      ← TUDO para listar eventos aqui
  │   │   ├── GetEvents.endpoint.js
  │   │   └── index.js
  │   └── GetEventById/
  │       ├── GetEventById.handler.js
  │       ├── GetEventById.endpoint.js
  │       └── index.js
  └── reviews/
      └── ... (similar structure)
```

**Benefício**: Cada feature é **auto-contida**. Para modificar "Create Event", você só mexe em `CreateEvent/`!

## Estrutura de uma Feature (Slice)

Cada feature segue este padrão:

```
FeatureName/
├── FeatureName.handler.js    # Lógica de negócio + acesso a dados
├── FeatureName.endpoint.js   # Adaptador HTTP (req/res)
└── index.js                  # Export público
```

### 1. Handler (Núcleo da Feature)

Contém **TODA** a lógica necessária:
- Validação de entrada
- Regras de negócio
- Acesso ao banco de dados
- Formatação de saída

```javascript
// CreateEvent.handler.js
class CreateEventHandler {
  async handle(request) {
    // 1. Validação
    const validation = this.validate(request);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. Lógica de negócio
    const event = await this.createEvent(request);

    // 3. Retorno
    return { success: true, data: event };
  }

  validate(request) { /* ... */ }
  async createEvent(data) { /* SQL aqui */ }
}
```

### 2. Endpoint (Adaptador HTTP)

Camada **fina** que conecta HTTP ao handler:

```javascript
// CreateEvent.endpoint.js
const CreateEventHandler = require('./CreateEvent.handler');
const handler = new CreateEventHandler();

module.exports = async (req, res) => {
  try {
    const result = await handler.handle(req.body);
    res.status(201).json(result);
  } catch (error) {
    // Tratamento de erros HTTP
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Index (Interface Pública)

```javascript
// index.js
module.exports = require('./CreateEvent.endpoint');
```

## Princípios

### 1. Feature-First Organization
Cada feature vive em sua própria pasta, contendo **tudo** que precisa.

### 2. Vertical Cohesion
Código que **muda junto**, **vive junto**.
- Se mudar a regra de criação de evento, você muda apenas `CreateEvent/`
- Não precisa procurar arquivos espalhados em `controllers/`, `services/`, `repositories/`

### 3. Minimal Coupling
Features são **independentes** entre si.
- `CreateEvent/` não depende de `GetEvents/`
- Cada uma pode evoluir sem afetar a outra

### 4. Thin Endpoints
Endpoints são **apenas adaptadores HTTP**.
- Não contêm lógica de negócio
- Apenas convertem `req/res` para chamadas ao handler

### 5. Fat Handlers
Handlers contêm **toda** a lógica.
- Validação
- Regras de negócio
- Acesso a dados
- Facilita testes (não precisa de HTTP)

## Features Implementadas

### Events

#### CreateEvent
- **Path**: `POST /api/events`
- **Auth**: Required
- **Handler**: `features/events/CreateEvent/CreateEvent.handler.js`
- **Validações**:
  - Campos obrigatórios: name, description, organizerId, category, location, startDate
  - Latitude: -90 a 90
  - Longitude: -180 a 180

#### GetEvents
- **Path**: `GET /api/events`
- **Query Params**:
  - `page`, `limit` (paginação)
  - `category`, `search` (filtros)
  - `latitude`, `longitude`, `radius` (geolocalização)
  - `startDate`, `endDate` (datas)
- **Handler**: `features/events/GetEvents/GetEvents.handler.js`
- **Features**:
  - Busca geolocalizada (Haversine formula)
  - Filtros dinâmicos
  - Paginação

#### GetEventById
- **Path**: `GET /api/events/:id`
- **Handler**: `features/events/GetEventById/GetEventById.handler.js`

## Como Adicionar Nova Feature

### Passo 1: Criar estrutura
```bash
mkdir -p src/features/events/UpdateEvent
touch src/features/events/UpdateEvent/UpdateEvent.handler.js
touch src/features/events/UpdateEvent/UpdateEvent.endpoint.js
touch src/features/events/UpdateEvent/index.js
```

### Passo 2: Implementar Handler
```javascript
// UpdateEvent.handler.js
class UpdateEventHandler {
  async handle(eventId, data) {
    // Validação
    // Lógica de negócio
    // Update no banco
    return updatedEvent;
  }
}
```

### Passo 3: Implementar Endpoint
```javascript
// UpdateEvent.endpoint.js
const UpdateEventHandler = require('./UpdateEvent.handler');
const handler = new UpdateEventHandler();

module.exports = async (req, res) => {
  try {
    const result = await handler.handle(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Passo 4: Adicionar rota
```javascript
// features/routes.js
const UpdateEvent = require('./events/UpdateEvent');
router.put('/events/:id', authMiddleware, UpdateEvent);
```

## Testabilidade

### Testar Handler (sem HTTP)
```javascript
const UpdateEventHandler = require('./UpdateEvent.handler');

describe('UpdateEventHandler', () => {
  it('should update event', async () => {
    const handler = new UpdateEventHandler();
    const result = await handler.handle(1, { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });
});
```

### Testar Endpoint (com HTTP mock)
```javascript
const UpdateEvent = require('./UpdateEvent');

describe('UpdateEvent endpoint', () => {
  it('should return 200', async () => {
    const req = { params: { id: 1 }, body: { name: 'New' } };
    const res = { json: jest.fn(), status: jest.fn() };
    await UpdateEvent(req, res);
    expect(res.json).toHaveBeenCalled();
  });
});
```

## Comparação: Vertical vs Clean Architecture

| Aspecto | Vertical Slice | Clean Architecture |
|---------|---------------|-------------------|
| **Organização** | Por feature | Por camada técnica |
| **Mudança** | Mexe em 1 pasta | Mexe em 4 camadas |
| **Complexidade** | Baixa | Alta |
| **Reuso de código** | Baixo (duplicação OK) | Alto (abstração) |
| **Acoplamento** | Baixo entre features | Baixo via interfaces |
| **Melhor para** | Apps CRUD, MVPs, features independentes | Domínios complexos, muita lógica de negócio |

## Quando Usar Vertical Slice?

✅ **Bom para**:
- Features independentes (CRUD de eventos, reviews)
- Time ágil (entrega rápida)
- Aplicações com pouca lógica de negócio compartilhada
- Microservices pequenos

❌ **Não use para**:
- Domínio complexo com muita regra de negócio
- Necessidade de reutilizar lógica entre features
- Sistema legado com muitas dependências cruzadas

## Benefícios Neste Projeto

1. **Velocidade**: Adicionar nova feature é rápido
2. **Clareza**: Fácil encontrar código de uma feature
3. **Manutenção**: Mudanças são localizadas
4. **Onboarding**: Novos devs entendem features isoladamente
5. **Deploy**: Pode-se deployar features individualmente (feature flags)

## Evolução

### Código Compartilhado
Se houver lógica compartilhada entre features:
```
features/
├── _shared/
│   ├── database/
│   ├── validation/
│   └── utils/
└── events/
    └── ...
```

### Features Complexas
Para features muito complexas, pode-se usar sub-handlers:
```
CreateEvent/
├── CreateEvent.handler.js
├── CreateEvent.validator.js
├── CreateEvent.repository.js
├── CreateEvent.endpoint.js
└── index.js
```

## Referências

- [Vertical Slice Architecture - Jimmy Bogard](https://www.youtube.com/watch?v=SUiWfhAhgQw)
- [CQRS and Vertical Slices](https://jimmybogard.com/vertical-slice-architecture/)
- [Feature Folders](https://scottlilly.com/how-to-organize-your-c-solution-feature-folders/)

---

**Implementado por**: [ADICIONAR NOMES DOS ALUNOS]
**Data**: Janeiro 2025
**Disciplina**: Arquitetura Cloud
