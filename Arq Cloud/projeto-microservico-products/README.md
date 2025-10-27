# VIBRA - Events Microservice

Microserviço de gerenciamento de eventos, avaliações e sistema de interesse da plataforma VIBRA.

## Tecnologias

- Node.js
- Express
- Azure SQL Server (Free 1 DTU)
- Swagger/OpenAPI

## Funcionalidades

- CRUD completo de eventos
- Sistema de avaliações (reviews) com notas de 1-5
- Sistema de interesse (interessado/vou comparecer)
- Filtros por categoria, data e geolocalização
- Busca por proximidade (raio em km)
- API RESTful completa

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar variáveis de ambiente no .env
# DB_SERVER - Servidor Azure SQL
# DB_DATABASE - Nome do banco de dados
# DB_USER - Usuário
# DB_PASSWORD - Senha
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O script irá automaticamente:
1. Conectar ao Azure SQL
2. Criar as tabelas se não existirem
3. Criar índices para melhor performance
4. Iniciar o servidor

## API Documentation

Acesse a documentação completa da API:
- Local: http://localhost:3002/api-docs
- Swagger YAML: [swagger.yaml](./swagger.yaml)

## Endpoints Principais

### Eventos
- GET `/api/events` - Listar eventos (com filtros)
- GET `/api/events/:id` - Buscar evento por ID
- POST `/api/events` - Criar evento
- PUT `/api/events/:id` - Atualizar evento
- DELETE `/api/events/:id` - Deletar evento
- GET `/api/events/categories` - Listar categorias

### Avaliações
- GET `/api/events/:id/reviews` - Listar avaliações
- POST `/api/events/:id/reviews` - Criar avaliação
- PUT `/api/reviews/:id` - Atualizar avaliação
- DELETE `/api/reviews/:id` - Deletar avaliação

### Interesse
- GET `/api/events/:id/interest` - Listar interessados
- POST `/api/events/:id/interest` - Marcar interesse
- PUT `/api/events/:id/interest/:interestId` - Atualizar status
- DELETE `/api/events/:id/interest/:interestId` - Remover interesse

## Filtros de Busca

A API de listagem de eventos suporta os seguintes filtros:

- `category` - Filtrar por categoria
- `startDate` - Data mínima
- `endDate` - Data máxima
- `latitude` + `longitude` + `radius` - Busca por proximidade
- `search` - Buscar no nome ou descrição
- `page` + `limit` - Paginação

Exemplo:
```
GET /api/events?category=Festival&latitude=-23.5505&longitude=-46.6333&radius=10&page=1&limit=10
```

## Docker

```bash
# Build
docker build -t vibra-events-service .

# Run
docker run -p 3002:3002 --env-file .env vibra-events-service
```

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| PORT | Porta do servidor | 3002 |
| DB_SERVER | Servidor Azure SQL | xxx.database.windows.net |
| DB_DATABASE | Nome do banco | vibra_events |
| DB_USER | Usuário do banco | admin |
| DB_PASSWORD | Senha do banco | *** |
| DB_ENCRYPT | Encriptar conexão | true |
| CORS_ORIGIN | Origem permitida CORS | http://localhost:3000 |

## Estrutura do Banco de Dados

### Events
- id (INT, PK, IDENTITY)
- name, description, category
- organizerId (referência ao Users Service)
- location, latitude, longitude
- startDate, endDate
- imageUrl
- createdAt, updatedAt

### Reviews
- id (INT, PK, IDENTITY)
- eventId (FK)
- userId
- rating (1-5)
- comment
- createdAt

### EventInterest
- id (INT, PK, IDENTITY)
- eventId (FK)
- userId
- status (interested/going)
- createdAt

## Estrutura do Projeto

```
src/
├── config/          # Configurações e SQL init
├── controllers/     # Controladores
├── middleware/      # Middlewares
├── routes/          # Rotas
├── app.js          # Configuração Express
└── server.js       # Entry point
```

## Contribuindo

Este projeto faz parte do PJBL da plataforma VIBRA.

## Licença

MIT
